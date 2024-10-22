import { hashSync } from "bcrypt";
import { systemRoles } from "../../src/Utils/system-roles.utils.js";
import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const userSchema = new Schema({
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
    password:{
        type:String,
        required:true
    },
    isMarkedAsDeleted:{
        type:Boolean,
        default:false
    },
    otp: {
        type: String,
    },
    passwordResetExpires:Date,
    verifyPasswordReset:Boolean,
},{timestamps:true})

//============document middleware=============
userSchema.pre("save",function(){
    
    if(this.isModified("password")){    
        this.password=hashSync(this.password,+process.env.SALT_ROUNDS)
    }
});

//==================query middleware=============
userSchema.pre(["updateOne"],function(){
    if(this.isModified("password")){
        this.password=hashSync(this.password,+process.env.SALT_ROUNDS)
    }
    console.log(this.getQuery());//this.getQuery() or this.getFilter() return the condtions wich i used to find user like _id
    
})
export const User = mongoose.models.User ||model("User", userSchema);
