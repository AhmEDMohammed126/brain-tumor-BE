import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const adminChangeLogSchema = new Schema({
    userEmail:{
        type:String,
        required:true
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:"Admin",
        required:true
    },
    action:{
        type:String,
        required:true,
        enum:["CREATE","UPDATE","SOFT-DELETE","DELETE"]
    },
    changes:{
        type:Object,
        required:true
    },
},{timestamps:true});

export const AdminChangeLog = mongoose.models.AdminChangeLog || model("AdminChangeLog",adminChangeLogSchema)