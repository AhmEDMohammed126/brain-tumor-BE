import mongoose from "../global-setup.js";
import { Schema,model } from "mongoose";

const clinicSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Doctor"
    },
    clinicName:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:true
    },
    //check this    
    workDays:[{
        day:{
            type:String,
            required:true,
            //handel in utils
            enum:[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
                ],
        },
        //open & close must be send together
        openTime:{
            type:String,
            required:true,
        },
        closeTime:{
            type:String,
            required:true,
        }
    }],
    city:{
        type:String,
        required:true
    },
    buildingNumber:{
        type:Number,
        required:true
    },
    floorNumber:{
        type:Number,
        required:true
    },
    street:{
        type:String,
        required:true
    },
    isMarkedAsDeleted:{
        type:Boolean,
        default:false
    },
    consultationFess:{
        type:Number,
        required:true,
        min:0
    }   
},{timestamps:true});

clinicSchema.pre("save",async function(){
    const {userId}=this;
    if(this.isDefault){
        await Clinic.updateOne({userId,isDefault:true},{isDefault:false})
    }
})
export const Clinic=mongoose.models.Clinic || model("Clinic",clinicSchema)