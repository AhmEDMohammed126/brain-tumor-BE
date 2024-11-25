import { hashSync } from "bcrypt";
import { systemRoles } from "../../src/Utils/system-roles.utils.js";
import mongoose from "../global-setup.js";
import { Badges } from "../../src/Utils/enums.utils.js";

const { Schema, model } = mongoose;

const doctorSchema = new Schema({
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
        enum:systemRoles.DOCTOR,
    },
    password:{
        type:String,
        required:true
    },
    DOB:{
        //1990-05-15
        type:Date,
        required:true
    },
    passwordResetExpires:Date,
    verifyPasswordReset:Boolean,
    status: {
        // (online : true , offline:false )
        type: Boolean,
        required: true,
        default: false,
    },
    otp: {
        type: String,
    },
    age:{
        type:Number,
    },
    badges:{
        type:[String],
        enum: Object.values(Badges),
    },
    gender:{
        type:String,
        required:true,
        enum:['male','female']
    },
    bio:{
        type:String,
        required:true
    },
    isDoctorVerified:{
        type:Boolean,
        default:false
    },
    medicalLicense:{
        type:Number,
        required:true
    },
    isEmailVerified:{
        type:Boolean,
        default:false
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
    certifications:{
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
    experienceYears:{
        type:Number,
        required:true
    },
    patients:[
        {
            patientId:{
                type:Schema.Types.ObjectId,
                ref:"Patient",
                required:true
            },
        }
    ],
    rating:Number
},{timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}});

//============document middleware=============
doctorSchema.pre("save",function(){
    if(this.isModified("password")){    
        this.password=hashSync(this.password,+process.env.SALT_ROUNDS)
    }
});

//==================query middleware=============
doctorSchema.pre(["updateOne"],function(){
    if(this.isModified("password")){
        this.password=hashSync(this.password,+process.env.SALT_ROUNDS)
    }
    console.log(this.getQuery());//this.getQuery() or this.getFilter() return the condtions wich i used to find user like _id
    
})

doctorSchema.virtual('Reviews',
    {
        ref:'Review',
        localField:'_id',
        foreignField:'doctorId'
    }
);
doctorSchema.virtual('Clinics',
    {
        ref:'Clinic',
        localField:'_id',
        foreignField:'userId'
    }
);

export const Doctor = mongoose.models.Doctor ||model("Doctor", doctorSchema);