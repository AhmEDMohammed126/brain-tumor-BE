import Joi from "joi";
import { generalRules, systemRoles } from "../../Utils/index.js";

export const registerDoctorSchema = {
    body:Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    email:  generalRules.email.required(),
    password: generalRules.password.required(),
    DOB: Joi.date().required(),
    gender: Joi.string().valid('male', 'female').required(),
    bio: Joi.string().required(),
    medicalLicense: Joi.number().required(),
    experienceYears: Joi.number().min(0).required(),
    clinicName: Joi.string().min(4).required(),
    userType: Joi.string().valid("Doctor").required(),
    workDays: Joi.array()
    .items(
        Joi.object({
            day: Joi.string()
            .valid("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
            .required(),
            openTime: Joi.string().required(),
            closeTime: Joi.string().required(),
    })).required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    buildingNumber: Joi.number().min(0).required(),
    floorNumber: Joi.number().min(0).required(),
    number: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required(),
    consultationFess: Joi.number().min(0).required(),
    })
};

export const verifySchema = {
    params: Joi.object({
        confirmationToken: Joi.string().required(),
    }),
};

export const getDoctorSchema ={
    params : Joi.object({
        doctorId:generalRules._id.required(),
    })
};

export const updateDoctorSchema ={
    body:Joi.object({
        firstName: Joi.string().min(1).max(50).optional(),
        lastName: Joi.string().min(1).max(50).optional(),
        email:  generalRules.email.optional(),
        gender: Joi.string().valid('male', 'female').optional(),
        bio: Joi.string().optional(),
        medicalLicense: Joi.number().optional(),
        experienceYears: Joi.number().min(0).optional(),
    })
};

export const approveOrRejectRequestSchema = {
    params: Joi.object({
        doctorId: generalRules._id.required(),
    }),
    body: Joi.object({
        status: Joi.boolean().required(),
        reasons: Joi.string().optional(),
    }),
};
