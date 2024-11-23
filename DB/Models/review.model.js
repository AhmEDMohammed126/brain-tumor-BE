import { ReviewStatus } from "../../src/Utils/enums.utils.js";
import mongoose from "../global-setup.js";
import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"Patient",
        required:true
    },
    doctorId:{
        type:Schema.Types.ObjectId,
        ref:"Doctor",
        required:true
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    review:String,
    reviewStatus:{
        type:String,
        enum:Object.values(ReviewStatus),
        default:ReviewStatus.PENDING
    },
    actionDoneBy:{
        type:Schema.Types.ObjectId,
        ref:"Admin"
    }
},{timestamps:true});

export const Review= mongoose.models.Review || model("Review",reviewSchema)