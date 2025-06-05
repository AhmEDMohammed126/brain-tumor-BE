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
    weight: {
            type: Number,
    },
    height: {
            type: Number,
    },
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
            dateAdded: { type: Date, default: Date.now },   
        },
    ],
    orders: {
        type: [String],
        default: [],
    },
    notes: {
        type: String,
    },
    updateLogs: [{
        timestamp: { type: Date, default: Date.now },
        changedFields: [String], // List of field names that were modified
        oldValues: Object // Stores previous values of changed fields
    }]
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