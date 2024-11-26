import { Clinic, Doctor, User } from "../../../DB/Models/index.js"
import { sendEmailService } from "../../../services/send-email.service.js"
import { compareSync, hashSync } from "bcrypt"
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { ApiFeatures, ErrorClass, uploadFile } from "../../Utils/index.js";

/**
 * @api {post} /users/register  Register a new user
 */
export const registerDoctor = async(req, res,next) =>{
    const {firstName,lastName,email,password,DOB,gender,userType,bio,medicalLicense,experienceYears,
        clinicName,number,workDays,city,buildingNumber,floorNumber,street,consultationFess}=req.body

    // check if the email is already registered
    const existingUser=await Doctor.findOne({email,isMarkedAsDeleted:false})
    if(existingUser)
        return next(
            new ErrorClass("Invalid credentials", 400, "Email or User name is already registered")
        );
    // Calculate age from DOB
    const dobDate = new Date(DOB);
    const currentYear = new Date().getFullYear();
    const age = currentYear - dobDate.getFullYear();

    // upload the image & pdf to cloudinary
    const imageFile = req.files?.profilePic?.[0];
    const pdfFile = req.files?.certifications?.[0];
    if(!imageFile || !pdfFile)return next(new ErrorClass('Please upload an image and pdf',400,'Please upload an image and pdf'));
    const customId = nanoid(4);
    const { secure_url :imageUrl, public_id : imagePublicId  } = await uploadFile({
        file: imageFile.path,
        folder: `${process.env.UPLOADS_FOLDER}/Doctor/profile-pictures/${customId}`,
    });
    const { secure_url : pdfUrl, public_id : pdfPublicId } = await uploadFile({
        file: pdfFile.path,
        folder: `${process.env.UPLOADS_FOLDER}/Doctor/certifications/${customId}`,
        resource_type: 'raw',
    });
    const user = await User.findOne({ email,isMarkedAsDeleted:false });
    if(user){
        return next(
            new ErrorClass("Invalid credentials", 400, "Email or User name is already registered")
        );
    }
    //create new user 
    const newUser = await User.create({ email, password, userType });

    //create new doctor instance
    const doctorInstance=new Doctor({
        firstName,
        lastName,
        email,
        userType,
        DOB,
        gender,
        bio,
        medicalLicense,
        age: age,
        profilePic: { secure_url: imageUrl, public_id: imagePublicId },
        certifications: { secure_url: pdfUrl, public_id: pdfPublicId },
        experienceYears,
    })
    
    //create new clinic instance
    const clinic = new Clinic({
        userId: doctorInstance._id,
        clinicName,
        workDays,
        street,
        city,
        buildingNumber,
        floorNumber,
        number,
        consultationFess,
    });
    //generate token instead of sending _id
    const confirmationToken = jwt.sign(
        { user: doctorInstance },
        process.env.CONFIRM_TOKEN,
        { expiresIn: "1h" }
    );
    // generate email confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/doctors/confirmation/${confirmationToken}`;
    //sending email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: `welcome to our application doctor ${doctorInstance.firstName} `,
        htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
    });

    if (isEmailSent.rejected.length) {
        return res
            .status(500)
            .json({ message: "verification email sending is failed " });
    }
    await doctorInstance.save();
    const savedclinic=await clinic.save();
    res.status(201).json({message:"Doctor account created successfully",data:doctorInstance,savedclinic})
}


/*
* @api {get} /doctors/confirmation/:confirmationToken  Verify Email
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
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
    //update isemailVerified in Doctor model
    const doctor=await Doctor.findOneAndUpdate({email:data?.user.email,isEmailVerified: false},{ isEmailVerified: true },
        { new: true }).select('-password -__v');
    if (!doctor) {
        return next(
            new ErrorClass("Invalid credentials", 400, "not confirmed")
        );
    }
      // response
    res.status(200).json({ message: "User email successfully confirmed ", user });
};

/**
 * @api {get} /doctors/getDoctors get all doctors
 * @returns  {object} return response {message, data}
 * @description get all doctors
 */

export const getDoctors=async (req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    //find docters
    const model = Doctor
    req.query.isDoctorVerified = true;
    req.query.isMarkedAsDeleted = false;
    req.query.isEmailVerified = true;
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        { path: "Reviews", select: "-__v" },
        { path: "Clinics", select: "-__v" }
    ])
    .pagination()
    .filter()
    .sort();
    const doctors = await ApiFeaturesInstance.mongooseQuery;
    if (!doctors) {
        return next(
            new ErrorClass("No doctors found", 404, "doctors not found")
        );
    }
    res.status(200).json({ message: "All Doctors", data: doctors });
}

/**
 * @api {get} /doctors/getInfo get loged user info
 * @returns {object} return response {message, data}
 */

export const getInfo = async (req, res, next) => {
    //destruct user from req
    const { authUser } = req;
    //find user
    const doctor = await Doctor.findById(authUser._id).populate([
        {
            path: "patients.patientId",
            select: " -__v -_id"
        },
        { path: "Reviews", select: "-__v" },
        { path: "Clinics", select: "-__v" }
    ]).select("-__v");
    if (!doctor) {
        return next(
            new ErrorClass("No doctor found", 404, "doctor not found")
        );
    }
    //response
    res.status(200).json({ message: "Doctor", data: doctor });
}

/**
 * @api {get} /doctors/getDoctor/:doctorId get doctor by id
 * @returns {object} return response {message, data}
 */
export const getDoctor = async (req, res, next) => {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).select('-__v');
    if (!doctor) {
        return next(
            new ErrorClass("No doctor found", 404, "doctor not found")
        );
    }
    res.status(200).json({ message: "doctor", data: doctor });
}

/**
 * @api {get} /doctors/getBlockedDoctors
 * @returns  {object} return response {message, data}
 * @description get bloched  doctor
 * */

export const getBlockedDoctors = async (req, res, next) => {
    const doctors = await Doctor.find({ isMarkedAsDeleted: true}).select('-__v');
    if (!doctors) {
        return next(
            new ErrorClass("No blocked doctors found", 404, "doctors not found")
        );
    }
    res.status(200).json({ message: "All Blocked doctors", data: doctors });
};

/**
 * @api {put} /doctors/updateDoctor/:doctorId update doctorId update doctor
 */
export const updateAccount=async(req, res,next) => {
    const {firstName,lastName,email,gender,bio,medicalLicense,experienceYears}=req.body;
    const {authUser}=req;
    const isEmailExist=await User.findOne({email});
    if(isEmailExist) return res.status(400).json({message:"email already exist"})
    const doctor=await Doctor.findById(authUser._id);
    
    const imageFile = req.files?.profilePic?.[0];
    //update profile picture
        if(imageFile){
            const Newpublic_id = doctor.profilePic.public_id.split(`${doctor.customId}/`)[1];
            const {secure_url}=await uploadFile({
                file: imageFile.path,
                folder: `${process.env.UPLOADS_FOLDER}/Doctor/profile-pictures/${doctor.customId}`,
                publicId: Newpublic_id
                }
            )
            doctor.profilePic.secure_url=secure_url   
        }     
    //update pdf certification
    const pdfFile = req.files?.certifications?.[0];
        if(pdfFile){
            const Newpublic_id = doctor.certifications.public_id.split(`${doctor.customId}/`)[1];
            const {secure_url}=await uploadFile({
                file: pdfFile.path,
                folder: `${process.env.UPLOADS_FOLDER}/Doctor/certifications/${doctor.customId}`,
                publicId: Newpublic_id,
                resource_type: 'raw',
                }
            )
            doctor.certifications.secure_url=secure_url   
        }

    doctor.firstName=firstName || doctor.firstName;
    doctor.lastName=lastName || doctor.lastName;
    doctor.email=email || doctor.email;
    doctor.gender=gender || doctor.gender;
    doctor.bio=bio || doctor.bio;
    doctor.medicalLicense=medicalLicense || doctor.medicalLicense;
    doctor.experienceYears=experienceYears || doctor.experienceYears;
    
    if(email){
        const user=await User.findOne({email:authUser.email});        
        user.email=email;
        user.isEmailVerified=false;
        doctor.isEmailVerified = false;
        const confirmationToken=jwt.sign({user:doctor},process.env.CONFIRM_TOKEN,{expiresIn:"1h"});
        const confirmationLink = `${req.protocol}://${req.headers.host}/doctors/confirmation/${confirmationToken}`;
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

    await doctor.save();
    return res.status(200).json({message:"updated"})
}

/** 
 * @api {get} /doctors/requestedDoctors get all requested doctors
 * @returns  {object} return response {message, data}
 * @description get all requested doctors
*/
export const getRequestedDoctors = async (req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    //find docters
    const model = Doctor
    req.query.isDoctorVerified = false;
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        { path: "Clinics", select: "-__v" }
    ])
    .pagination()
    .filter()
    .sort();
    const requestedDoctors = await ApiFeaturesInstance.mongooseQuery;
    if (!requestedDoctors) {
        return next(
            new ErrorClass("No requested doctors found", 404, "requested doctors not found")
        );
    }
    res.status(200).json({ message: "All requested doctors", data: requestedDoctors });
};

/**
 * @api {patch} /doctors/approveOrRejectRequest/:doctorId approve or reject request
 * @returns  {object} return response {message, data}
 * @description approve or reject request
 */

export const approveOrRejectRequest = async (req, res, next) => {
    const { doctorId } = req.params;
    const { status , reasons } = req.body;
    const doctor = await Doctor.findOneAndUpdate({_id:doctorId,isDoctorVerified: false}, { isDoctorVerified: status }, { new: true });
    if (!doctor) {
        return next(
            new ErrorClass("No doctor found", 404, "doctor not found")
        );
    }

    if(status==true) {
        //send email to tell the doctor is approved
        const isEmailSent=await sendEmailService({
            to:doctor.email,
            subject:"your request is approved",
            htmlMessage:`<h3>your request is approved doctor ${doctor.firstName} we are happy to have you, you can login now</h3>`
        })
        if(isEmailSent.rejected.length) 
            return next(
                new ErrorClass("Invalid credentials", 400, "email sending is failed")
            );
    }
    if(status==false){
        //send email to tell the doctor is approved
        const isEmailSent=await sendEmailService({
            to:doctor.email,
            subject:"your request is rejected",
            htmlMessage:`<h3>your request is rejected doctor ${doctor.firstName} we are sorry to inform our reasons is ${reasons}</h3>`
        })
        if(isEmailSent.rejected.length) 
            return next(
                new ErrorClass("Invalid credentials", 400, "email sending is failed")
            );

    }
    res.status(200).json({ message: "Doctor request updated", data: doctor });
};