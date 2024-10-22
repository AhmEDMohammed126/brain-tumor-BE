import mongoose from "../global-setup.js";
import { systemRoles } from "../../src/Utils/index.js";
const { Schema, model } = mongoose;

const adminSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    userType:{
        type:String,
        required:true,
        enum:Object.values(systemRoles),
    },
    status: {
        // (online : true , offline:false )
        type: Boolean,
        required: true,
        default: false,
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:['male','female']
    },
    phone:{
        type:String,
        required:true
    },
    isMarkedAsDeleted:{
        type:Boolean,
        default:false
    },
    profilePic:{
        secure_url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        }
    },
    customId:String,
    isLogedIn:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const Admin = mongoose.models.Admin || model( "Admin", adminSchema );
