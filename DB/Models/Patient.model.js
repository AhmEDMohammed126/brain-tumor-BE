import { systemRoles } from "../../src/Utils/system-roles.utils.js";
import mongoose from "../global-setup.js";
import { ReviewStatus } from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

const patientSchema = new Schema({
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
        enum:systemRoles.PATIENT,
    },
    status: {
        // (online : true , offline:false )
        type: Boolean,
        required: true,
        default: false,
    },
    DOB: {
        type: Date,
        required: true,
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
    customId:String,
    address:{
        street:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        }
    },
    listOfEmergency:[
        {
            name:{
                type:String,
                required:true
            },
            phone:{
                type:String,
                required:true
            },
            relation:{
                type:String,
                required:true,
                enum:['Spouse','Child','Friend','Family Member','Other'],
            }
        }
    ],
    //TODO:Array of MRIs that patient do 
    
},{timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}});

patientSchema.post(["findOneAndDelete","deleteOne"], async function () {
    const _id = this.getQuery()._id;
     // delete the related clinics from db
    await mongoose.models.Storie.deleteMany({ userId:_id });
});
// //============document middleware=============
// patientSchema.pre("save",function(){
//     if(this.isModified("password")){    
//         this.password=hashSync(this.password,+process.env.SALT_ROUNDS)
//     }
// });

patientSchema.virtual('stories',
    {
        ref:'Storie',
        localField:'_id',
        foreignField:'userId',
        match: { status: ReviewStatus.APPROVED } // Add a condition to match only approved stories
    }
);

export const Patient = mongoose.models.Patient ||model("Patient", patientSchema);