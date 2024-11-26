import Joi from "joi";

export const registerPatientSchema = {
    body:Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
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