import mongoose from "mongoose";

const { Schema, model } = mongoose;

const medicalHistorySchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    allergy: [{
        addedById: { type: Schema.Types.ObjectId, required: true, refPath: "allergy.addedByRole" },
        addedByRole: { type: String, enum: ["Doctor", "Patient"], required: true },
        allergyName: { type: String, required: true },
        dateAdded: { type: Date, default: Date.now },
        },
    ],
    chronicDiseases: [{
        addedById: { type: Schema.Types.ObjectId, required: true, refPath: "chronicDiseases.addedByRole" },
        addedByRole: { type: String, enum: ["Doctor", "Patient"], required: true },
        chronicName: { type: String, required: true },
        dateAdded: { type: Date, default: Date.now },
        },
    ],
    pastSurgeries: [{
        name: { type: String, required: true },
        date: { type: Date, required: true },
        notes: { type: String },
        dateAdded: { type: Date, default: Date.now },
        },
    ],
    familyHistory: [{
        relation: { type: String, required: true },
        age: { type: Number, required: true },
        condition: { type: String, required: true },
        dateAdded: { type: Date, default: Date.now },
        },
    ],
    medicalDocuments: [{
        customId:{ type: String, required: true },
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        dateAdded: { type: Date, default: Date.now },
        },
    ],
    medication: [{
        addedById: { type: Schema.Types.ObjectId, required: true, refPath: "medication.addedByRole" },
        addedByRole: { type: String, enum: ["Doctor", "Patient"], required: true },
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        dateAdded: { type: Date, default: Date.now },
        },
    ],
    lifeStyle: [{ type: String, required: true }],
    encounter: [{
            encounterId: { type: Schema.Types.ObjectId, ref: "Encounter" } 
        }],
    },
    {timestamps: true,toJSON: { virtuals: true },toObject: { virtuals: true },}
);

// Virtual populate for patient (to fetch full patient details)
medicalHistorySchema.virtual("patient", {
  ref: "Patient",          // Reference the Patient model
  localField: "patientId", // Field in MedicalHistory
  foreignField: "_id",     // Field in Patient
  justOne: true,           // Return a single document (not an array)
});

export const MedicalHistory=mongoose.models.MedicalHistory || model("MedicalHistory", medicalHistorySchema);
