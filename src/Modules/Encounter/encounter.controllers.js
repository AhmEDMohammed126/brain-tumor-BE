import {MedicalHistory,Patient,Encounter, Appointment} from "../../../DB/Models/index.js";
import { ApiFeatures, ErrorClass, uploadFile } from "../../Utils/index.js";

// CREATE COMPLETE ENCOUNTER
/**
 * @api {post} /encounters/createEncounter
 */
export const createEncounter = async (req, res, next) => {
    const {
        patientId,
        appointmentId,
        complaint,
        diagnosis,
        medications,
        orders,
        notes
    }= req.body;

  const doctorId = req.authUser._id;

  // 1. Validate exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
        return next(new ErrorClass("Patient not found", 404, "NOT_FOUND"));
    }

    const appointment=await Appointment.findOne({_id:appointmentId,doctorId:doctorId,patientId:patientId,status:"confirmed"});
    if(!appointment){
        return next(new ErrorClass("ther is no appointment found", 404, "NOT_FOUND"));
    }
  // 2. Create encounter
    const encounter = new Encounter({
        patientId,
        doctorId,
        appointmentId,
        complaint,
        diagnosis,
        medications,
        orders,
        notes
    });

  // 3. Save encounter and update medical history
    if(appointment.addConsent===false){
        await MedicalHistory.findOneAndUpdate(
            { patientId },
            { 
                $push: { 
                encounter: { encounterId: encounter._id }}},{ new: true });
        }
    await MedicalHistory.findOneAndUpdate(
        { patientId },
        { 
            $push: { 
            encounter: { encounterId: encounter._id },
            medication: medications.map(med => ({
                addedById: doctorId,
                addedByRole: "Doctor",
                ...med,
                dateAdded: new Date()
            }))
            }
        },{ new: true });
    await encounter.save();
    res.status(201).json({success: true,data: encounter});
};

//get encounter using api features and filter
/**
 * @api {get} /encounters/getEncounter
 */

export const getEncounter = async (req, res, next) => {
    const {page=1,limit=20,sort,...filters}=req.query;
    //find docters
    const model = Encounter
    const ApiFeaturesInstance = new ApiFeatures(model,req.query)
    .pagination()
    .filter()
    .sort();
    const encounters = await ApiFeaturesInstance.mongooseQuery;
    if (!encounters) {
        return next(
            new ErrorClass("No encounters found", 404, "encounters not found")
        );
    }
    res.status(200).json({ message: "All encounters", data: encounters }); 
};