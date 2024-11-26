import { Patient,User } from "../../../DB/Models/index.js"
import { sendEmailService } from "../../../services/send-email.service.js"
import { compareSync, hashSync } from "bcrypt"
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import otpGenerator from "otp-generator";
import { ErrorClass, uploadFile } from "../../Utils/index.js";


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
        password,
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
    res.status(200).json({ message: "User email successfully confirmed ", patient });
    // response
    res.status(200).json({ message: "User email successfully confirmed ", user });
};