import { sendEmailService } from "../../../services/send-email.service.js"
import { compareSync, hashSync } from "bcrypt"
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import otpGenerator from "otp-generator";
import { cloudinaryConfig, ErrorClass, systemRoles, uploadFile } from "../../Utils/index.js";
import {User, Admin } from "../../../DB/Models/index.js";

/**
 * @api {post} /api/users/register Register User
 */
export const registerUser = async(req, res,next) =>{
    const {firstName,lastName,email,password,userType,gender,age,phone}=req.body

    // check if the email is already registered
    const existingUser=await User.findOne({email,isMarkedAsDeleted:false})
    if(existingUser)
        return next(
            new ErrorClass("Invalid credentials", 400, "Email or User name is already registered")
        );
    // upload the image to cloudinary
    if(!req.file)return next(new ErrorClass('Please upload an image',400,'Please upload an image'));
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Users/${customId}`,
    });
    
    const userInstance=new User({
        email,
        password,
        userType,
    })

    //check if userType
    let adminInstance=null;
    if(userType==systemRoles.ADMIN){
        adminInstance=new Admin({
            firstName,
            lastName,
            email,
            userType,
            status:false,
            age,
            gender,
            phone,
            profilePic:{
                public_id,
                secure_url
            },
            customId
        })
    }

    
    //generate token instead of sending _id
    const confirmationToken = jwt.sign(
        { user: adminInstance },
        process.env.CONFIRM_TOKEN,
        { expiresIn: "1h" }
    );
    // generate email confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/users/confirmation/${confirmationToken}`;
    //sending email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "welcome",
        htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
    });

    if (isEmailSent.rejected.length) {
        return res
            .status(500)
            .json({ message: "verification email sending is failed " });
    }

    await userInstance.save();
    await adminInstance.save();

    res.status(201).json({message:"User created successfully",data:adminInstance})
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
    const confirmedUser = await Admin.findOneAndUpdate(
        { _id: data?.user._id, isEmailVerified: false },
        { isEmailVerified: true },
        { new: true }
    );
    if (!confirmedUser) {
        return next(
            new ErrorClass("Invalid credentials", 400, "not confirmed")
        );
    }
      // response
    res.status(200).json({ message: "User email successfully confirmed ", confirmedUser });
};

/***
 * @api {post} /users/login  Login user
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message, token}
 * @description login user
 */
export const login = async (req, res, next) => {
    // destruct email and password from req.body
    const { email, password } = req.body;
    // find user
    const user = await User.findOne({email,isEmailVerified:true,isMarkedAsDeleted:false});
    if (!user) {
        return next(
            new ErrorClass("Invalid credentials", 400, "Invalid email or password")
        );
    }
    const isMatch = compareSync(password, user.password);
    if (!isMatch) {
        return next(
            new ErrorClass("Invalid credentials", 400, "Invalid email or password")
        );
    }
    //select user 
    let Ouser=null;
    if(user.userType==systemRoles.ADMIN){
        Ouser=await Admin.findOne({email,isEmailVerified:true,isMarkedAsDeleted:false})
    }
    else if(user.userType==systemRoles.DOCTOR){
        //Ouser=await Doctor.findOne({email,isEmailVerified:true,isMarkedAsDeleted:false})
    }
    else if(user.userType==systemRoles.PATIENT){
       // Ouser=await Patient.findOne({email,isEmailVerified:true,isMarkedAsDeleted:false})
    }
    //update status
    Ouser.status = true;
    await Ouser.save();
    // generate the access token
    const token = jwt.sign({ userId: Ouser._id,userType:Ouser.userType }, process.env.LOGIN_SECRET,{expiresIn: "7d"});
    // response
    res.status(200).json({ message: "Login success", token });
};

