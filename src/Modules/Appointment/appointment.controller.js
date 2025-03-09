import { Appointment, Clinic, Doctor } from "../../../DB/Models/index.js";
import { ApiFeatures, ErrorClass } from "../../Utils/index.js";
import { sendEmailService } from "../../../services/send-email.service.js"
import { increaseTime } from "./appointment.utils.js";

/**
 * @api {post} /appointments/addAppointment Add a new appointment
 */
export const bookAppointment = async (req, res, next) => {
    const patientId = req.authUser._id;
    const { doctorId, clinicId,type, date, time,consentGiven } = req.body;
    //check if clinic is already doctor clinic
    const clinicExist = await Clinic.findOne({_id:clinicId, doctorId: doctorId});
    if (!clinicExist) {
        return next(new ErrorClass ("Clinic or doctor not found", 400,"Clinic or doctor not found"));
    }

    //check if patient is already booked in this time slot
    const patientBooked = await Appointment.findOne({ patientId, date, time });
    if (patientBooked) {
        return next(new ErrorClass ("You are already booked in this time slot", 400,"You are already booked in this time slot cancle the previous booking"));
    }
    const endTime = increaseTime(time, 1.5);
    const appointmentInstance = new Appointment({
        patientId,
        doctorId, 
        clinicId, 
        type,
        date, 
        time, 
        endTime,
        consentGiven
    });
    const newAppointment = await appointmentInstance.save();
    res.status(201).json({ message: "Appointment created", newAppointment });
}

//get appointment by id

/**
 * @api {get} /appointments/:appointmentId Get appointment by id
 */ 

export const getAppointmentById = async (req, res, next) => {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findOne({_id:appointmentId,$or:[{patientId: req.authUser._id},{doctorId: req.authUser._id}]}).populate(
            [
                {
                    path: "doctorId",
                    select: "firstName lastName _id",
                    match: {isMarkedAsDeleted: false}
                },
                {
                    path: "clinicId",
                    select: "clinicName _id",
                },
                {
                    path: "patientId",
                    select: "firstName lastName  _id",
                    match: {isMarkedAsDeleted: false}
                }
            ]
        );
        if (!appointment) {
            return next(new ErrorClass ("Appointment not found", 400,"Appointment not found"));
        }
        res.status(200).json({ appointment });
    }

//get the appointments 

export const getAppointments = async (req, res, next) => {
    const { page=1, limit=20, sort,...filters } = req.query;
    
    const model = Appointment;
    const ApiFeaturesInstance = new ApiFeatures(model, req.query,[])
    .pagination()
    .sort()
    .filter();

    const appointments = await ApiFeaturesInstance.mongooseQuery;
    if (!appointments) {
        return next(new ErrorClass ("No appointments found", 400,"No appointments found"));
    }
    res.status(200).json({ appointments });
}

//update status of appointment by doctor

/**
 * @api {put} /appointments/updateStatus/:appointmentId Update status of appointment by doctor
 */

export const updateAppointmentStatus = async (req, res, next) => {
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findOneAndUpdate({ _id: appointmentId , doctorId: req.authUser._id }, { status }, { new: true }).populate(
        {
            path: "patientId",
            select: "firstname email",
            match: {isMarkedAsDeleted: false}
        }
    );
    
    if (!appointment) {
        return next(new ErrorClass ("Appointment not found", 400,"Appointment not found"));
    }
    //send mail to patient if it confirmed or cancelled
    if(status === "confirmed" || status === "cancelled"){
        const { email } = appointment.patientId;
        const subject = status === "confirmed" ? "Appointment Confirmed" : "Appointment Cancelled";
        const message = status === "confirmed" ? `Your appointment has been confirmed and your appointment date is ${appointment.date} and range time from${appointment.time} to ${appointment.endTime}` : "Your appointment has been cancelled";
            
        //sending email
            const isEmailSent = await sendEmailService({
                to: email,
                subject: `dear ${appointment.patientId.firstName} :${subject} `,
                htmlMessage: `<p>${message}</p>`,
            });
        
            if (isEmailSent.rejected.length) {
                return res
                    .status(500)
                    .json({ message: "verification email sending is failed " });
            }
    }
    //add patient id to doctor list
    if(status === "confirmed"){
        const { patientId } = appointment;
        //check if patient is already added
        const patientExist = await Doctor.findOne({ _id: req.authUser._id, "patients.patientId": patientId });
        if (!patientExist) {
            const doctor = await Doctor.findOneAndUpdate({ _id: req.authUser._id }, { $addToSet: { patients: { patientId: patientId }} }, { new: true });
            if (!doctor) {
                return next(new ErrorClass ("Doctor not found", 400,"Doctor not found"));
        }
        }
        
    }
    res.status(200).json({ appointment });
}

//cancel appointment by patient
export const cancelAppointment = async (req, res, next) => {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({ _id: appointmentId , patientId: req.authUser._id});
    
    if (!appointment) {
        return next(new ErrorClass ("Appointment not found", 400,"Appointment not found"));
    }
    
    if (appointment.status === 'completed') {
        return next(new ErrorClass ("Cannot cancel a completed appointment", 400,"Cannot cancel a completed appointment"));
    };
    
    // Delete the appointment
    await Appointment.deleteOne({ _id: appointmentId });

    res.status(200).json({ message:'Appointment cancelled' });
};