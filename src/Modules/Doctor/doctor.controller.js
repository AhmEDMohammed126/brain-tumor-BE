import { Address, Doctor } from "../../../DB/Models/index.js"
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
    const {userName,email,password,userType,gender,age,phone,country,city,buildingNumber,floorNumber,addressLable}=req.body

    // check if the email is already registered
    const existingUser=await Doctor.findOne({$or:[{email,isMarkedAsDeleted:false},{userName}]})
    if(existingUser)
        return next(
            new ErrorClass("Invalid credentials", 400, "Email or User name is already registered")
        );
    // upload the image to cloudinary
    if(!req.file)return next(new ErrorClass('Please upload an image',400,'Please upload an image'));
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Doctor/${customId}`,
    });
    
    const doctorInstance=new User({
        userName,
        email,
        password,
        profilePic:{
            public_id,
            secure_url
        },
        customId,
        userType,
        gender,
        age,
        phone,
    })
    //create new address instance
    const addressInstance=new Address({
        userId:doctorInstance._id,
        country,
        city,
        buildingNumber,
        floorNumber,
        addressLable,
        isDefault:true
    })
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
        subject: `welcome to our application doctor ${doctorInstance.userName} `,
        htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
    });

    if (isEmailSent.rejected.length) {
        return res
            .status(500)
            .json({ message: "verification email sending is failed " });
    }

    await doctorInstance.save();
    const savedAddress=await addressInstance.save();
    res.status(201).json({message:"Doctor account created successfully",data:doctorInstance,savedAddress})
}
