import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const encounterSchema = new Schema({
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
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
    },
    diagnosis: [
        {
            diagnoseName: {
                type: String,
            },
            diagnoseInfo: {
                type: String,
            },
        },
    ],
    complaint: {
        type: String,
    },
    medications: [
        {
            name: {
                type: String,
            },
            dosage: {
                type: String,
            },
            frequency: {
                type: String,
            },
        },
    ],
    orders: {
        type: [String],
        default: [],
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual populate for Doctor
encounterSchema.virtual('doctor', {
    ref: 'Doctor',
    localField: 'doctorId',
    foreignField: '_id',
    justOne: true, // Since it's a single reference (not an array)
});

// Virtual populate for Patient
encounterSchema.virtual('patient', {
    ref: 'Patient',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true, // Since it's a single reference (not an array)
});

// Virtual populate for Appointment 
encounterSchema.virtual('appointment', {
    ref: 'Appointment',
    localField: 'appointmentId',
    foreignField: '_id',
    justOne: true, // Since it's a single reference (not an array)
});

export const Encounter = mongoose.models.Encounter || model("Encounter", encounterSchema);