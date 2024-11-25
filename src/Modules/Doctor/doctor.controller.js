import { Clinic, Doctor, User } from "../../../DB/Models/index.js"
import { sendEmailService } from "../../../services/send-email.service.js"
import { compareSync, hashSync } from "bcrypt"
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import otpGenerator from "otp-generator";
import { cloudinaryConfig, ErrorClass, uploadFile } from "../../Utils/index.js";

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
        password,
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
* @api {get} /users/confirmation/:confirmationToken  Verify Email
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