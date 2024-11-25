import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const storieSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    storie:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        enum: ["ACCEPTED", "REJECTED", "PENDING"],
        default: "PENDING"
    }
},{timestamps:true});   

export const Storie = mongoose.models.Storie || model("Storie", storieSchema);
