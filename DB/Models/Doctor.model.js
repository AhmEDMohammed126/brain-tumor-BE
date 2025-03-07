import mongoose from "../global-setup.js";
import { Badges } from "../../src/Utils/enums.utils.js";
import { systemRoles ,ReviewStatus} from "../../src/Utils/index.js";

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
    DOB:{
        type:Date,
        required:true
    },
    status: {
        // (online : true , offline:false )
        type: Boolean,
        required: true,
        default: false,
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


//==================query middleware=============
//if doctor deleted delete its clinics
doctorSchema.post(["findOneAndDelete","deleteOne"], async function () {
    const _id = this.getQuery()._id;
     // delete the related clinics from db
    await mongoose.models.Clinic.deleteMany({ doctorId:_id });
     // delete the related articles from db
    await mongoose.models.Article.deleteMany({ doctorId:_id });
    //TODO: remove related reviews
});

doctorSchema.virtual('Reviews',
    {
        ref:'Review',
        localField:'_id',
        foreignField:'doctorId',
        match: {reviewStatus:ReviewStatus.APPROVED}
    }
);
doctorSchema.virtual('Clinics',
    {
        ref:'Clinic',
        localField:'_id',
        foreignField:'doctorId'
    }
);

doctorSchema.virtual('Articles',
    {
        ref:'Article',
        localField:'_id',
        foreignField:'doctorId'
    }
);

doctorSchema.virtual('Patients', {
    ref: 'Patient',
    localField: 'patients.patientId',
    foreignField: '_id'
});

export const Doctor = mongoose.models.Doctor ||model("Doctor", doctorSchema);