import { Patient,User } from "../../../DB/Models/index.js"
import { sendEmailService } from "../../../services/send-email.service.js"
import { compareSync, hashSync } from "bcrypt"
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import otpGenerator from "otp-generator";
import { ApiFeatures, ErrorClass, uploadFile } from "../../Utils/index.js";

export const registerPatient = async(req, res,next) =>{
    const {firstName,lastName,email,password,DOB,gender,phone,address,listOfEmergency,userType}=req.body

    // check if the email is already registered
    const existingUser=await Patient.findOne({email,isMarkedAsDeleted:false})
    if(existingUser)
        return next(
            new ErrorClass("Invalid credentials", 400, "Email is already registered")
        );
    // Calculate age from DOB
    const dobDate = new Date(DOB);
    const currentYear = new Date().getFullYear();
    const age = currentYear - dobDate.getFullYear();

    // upload the image
    if(!req.file)
        return next(new ErrorClass('Please upload an image',400,'Please upload an image'));
    const customId = nanoid(4);
    const { secure_url , public_id  }= await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Patient/profile-pictures/${customId}`
    });
    const user = await User.findOne({ email,isMarkedAsDeleted:false });
    if(user){
        return next(
            new ErrorClass("Invalid credentials", 400, "Email or User name is already registered")
        );
    }
    //create new user 
    await User.create({ email, password, userType });

    //create new Patient instance
    const newPatient = new Patient({
        firstName,
        lastName,
        email,
        DOB,
        age,
        gender,
        phone,
        address,
        userType,
        listOfEmergency,
        profilePic: { secure_url, public_id },
    });

    //generate token instead of sending _id
    const confirmationToken = jwt.sign(
        { user: newPatient },
        process.env.CONFIRM_TOKEN,
        { expiresIn: "1h" }
    );
    // generate email confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/patients/confirmation/${confirmationToken}`;
    //sending email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: `welcome to our application ${newPatient.firstName} `,
        htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
    });

    if (isEmailSent.rejected.length) {
        return res
            .status(500)
            .json({ message: "verification email sending is failed " });
    }
    await newPatient.save();
    res.status(201).json({message:"Patient account created successfully",data:newPatient})
}

/*
* @api {get} /patients/confirmation/:confirmationToken  Verify Email
 * @returns  {object} return response {message, user}
 * @description verify Email of user
 */
export const verifyEmail = async (req, res, next) => {
    //destruct token from params
    const { confirmationToken } = req.params;
    //verifing the token
    const data = jwt.verify(confirmationToken, process.env.CONFIRM_TOKEN);
    const user=await User.findOneAndUpdate({email:data?.user.email,isEmailVerified: false},{ isEmailVerified: true },
        { new: true }).select('-password -__v');
    if (!user) {
        return next(
            new ErrorClass("Invalid credentials", 400, "not confirmed")
        );
    }
    //update patient model
    const patient = await Patient.findOneAndUpdate(
        { email: data?.user.email, isEmailVerified: false },
        { isEmailVerified: true },
        { new: true }
    ).select('-password -__v');
    if (!patient) {
        return next(
            new ErrorClass("Invalid credentials", 400, "not confirmed")
        );
    }
    // response
    res.status(200).json({ message: "User email successfully confirmed you can login now" });
    // response
    res.status(200).json({ message: "User email successfully confirmed you can login now" });
};

/**
 * @api {get} /patients/getPatients get all patients
 * @returns  {object} return response {message, data}
 * @description get all patients
 */


export const getPatients=async (req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    const model = Patient
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        { path: "stories", select: "-__v" },
    ])
    .pagination()
    .filter()
    .sort();
    const patients = await ApiFeaturesInstance.mongooseQuery;
    if (!patients) {
        return next(
            new ErrorClass("No patients found", 404, "patients not found")
        );
    }
    res.status(200).json({ message: "All Patients", data: patients });
}

/**
 * @api {get} /patients/getInfo get loged user info
 * @returns {object} return response {message, data}
 */

export const getInfo = async (req, res, next) => {
    //destruct user from req
    const { authUser } = req;
    //find user
    //TODO: MAKE POPULATE FOR ALL RELATED DATA
    const patient = await Patient.findById(authUser._id).populate('stories').select('-__v');
    //response
    res.status(200).json({ message: "Patient", data: patient });
};

/**
 * @api {get} /Patients/getPatient/:patientId get patient by id
 * @returns {object} return response {message, data}
 */
export const getPatient = async (req, res, next) => {
    const { patientId } = req.params;
    //TODO: POPULATE ALL RELATED WITHOUT STORIES & REVIEWS
    const patient = await Patient.findById(patientId).populate('stories').select('-__v');
    if (!patient) {
        return next(
            new ErrorClass("No patient found", 404, "patient not found")
        );
    }
    res.status(200).json({ message: "Patient", data: patient });
}

/**
 * @api {get} /patients/getBlockedPatients
 * @returns  {object} return response {message, data}
 * @description get bloched  patient
 * */

export const getBlockedPatients = async (req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    const model = Patient
    req.query.isMarkedAsDeleted =true; 
    const ApiFeaturesInstance = new ApiFeatures(model,req.query)
    .pagination()
    .filter()
    .sort();
    const patients = await ApiFeaturesInstance.mongooseQuery;
    // const patients = await Patient.find({ isMarkedAsDeleted: true}).select('-__v');
    if (!patients) {
        return next(
            new ErrorClass("No blocked patients found", 404, " patients not found")
        );
    }
    res.status(200).json({ message: "All Blocked Patients", data: patients });
};

/**
 * @api {put} /patients/updatePatient/:patientId update patientid update patient
 */
export const updateAccount=async(req, res,next) => {
    const {firstName,lastName,email,gender,phone,address,listOfEmergency}=req.body;
    const {authUser}=req;
    const isEmailExist=await User.findOne({email});
    if(isEmailExist) return res.status(400).json({message:"email already exist"})
    const patient=await Patient.findById(authUser._id);
    
    if(req.file){
        const Newpublic_id = patient.profilePic.public_id.split(`${patient.customId}/`)[1];
        const {secure_url}=await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/Patient/profile-pictures/${patient.customId}`,
            publicId: Newpublic_id
            }
        )
        patient.profilePic.secure_url=secure_url   
    }     

    patient.firstName=firstName || patient.firstName;
    patient.lastName=lastName || patient.lastName;
    patient.email=email || patient.email;
    patient.gender=gender || patient.gender;
    patient.phone=phone || patient.phone;
    patient.address=address || patient.address;
    patient.listOfEmergency=listOfEmergency || patient.listOfEmergency;
    if(email){
        const user=await User.findOne({email:authUser.email});
        user.email=email;
        user.isEmailVerified=false;
        patient.isEmailVerified = false;
        const confirmationToken=jwt.sign({user:patient},process.env.CONFIRM_TOKEN,{expiresIn:"1h"});
        const confirmationLink = `${req.protocol}://${req.headers.host}/patients/confirmation/${confirmationToken}`;
        const isEmailSent=await sendEmailService({
            to:email,
            subject:"verify your email",
            htmlMessage:`<a href=${confirmationLink}>please verify your account</a>`
        })
        if(isEmailSent.rejected.length) 
            return next(
                new ErrorClass("Invalid credentials", 400, "email sending is failed")
            ); 
        await user.save();
    }
    await patient.save();
    return res.status(200).json({message:"updated"})
}