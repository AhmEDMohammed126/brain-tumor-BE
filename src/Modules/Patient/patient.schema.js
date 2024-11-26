import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const registerPatientSchema = {
    body:Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email:  generalRules.email.required(),
        password: generalRules.password.required(),
        DOB: Joi.date().required(),
        gender: Joi.string().valid("male", "female").required(),
        phone: Joi.string().required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
        }).required(),
        listOfEmergency: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().required(),
                    phone: Joi.string().required(),
                    relation: Joi.string()
                        .valid("Spouse", "Child", "Friend", "Family Member", "Other")
                        .required(),
                })
            ).required(),
        userType: Joi.string().valid("Patient").required(),
        })
};

export const verifySchema = {
    params: Joi.object({
        confirmationToken: Joi.string().required(),
    }),
};

export const getPatientSchema ={
    params : Joi.object({
        patientId:generalRules._id.required(),
    })
};

export const updatePatientSchema = {
    body:Joi.object({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: generalRules.email.optional(),
        gender: Joi.string().valid("male", "female").optional(),
        phone: Joi.string().optional(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
        }).optional(),
        listOfEmergency: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().required(),
                    phone: Joi.string().required(),
                    relation: Joi.string()
                        .valid("Spouse", "Child", "Friend", "Family Member", "Other")
                        .required(),
                })
            ).optional(),
            public_id: Joi.string().optional(),
        })
}