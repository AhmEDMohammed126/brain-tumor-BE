import { AppointmentStatus , AppointmentType} from "../../src/Utils/enums.utils.js";
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    clinicId: {
        type: Schema.Types.ObjectId,
        ref: "Clinic",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    type: { 
        type: String, 
        enum: Object.values(AppointmentType), 
        required: true 
    },
    status:{
        type: String,
        enum: Object.values(AppointmentStatus),
        default: AppointmentStatus.PENDING
    },
    consentGiven:{
        type:Boolean,
        default: false
    }
},{timestamps:true});  

appointmentSchema.virtual('Patients', {
    ref: 'Patient',
    localField: 'patientId',
    foreignField: '_id'
});

appointmentSchema.virtual('Doctors', {
    ref: 'Doctor',
    localField: 'doctorId',
    foreignField: '_id'
});

appointmentSchema.virtual('Clinics', {
    ref: 'Clinic',
    localField: 'clinicId',
    foreignField: '_id'
});

export const Appointment = mongoose.models.Appointment || model("Appointment", appointmentSchema);
