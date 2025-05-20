import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const addClinicSchema ={
    body: Joi.object({
        clinicName: Joi.string().min(4).required(),
        number: Joi.string().required(),
        workDays: Joi.array()
        .items(
            Joi.object({
                day: Joi.string()
                .valid("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
                .required(),
                openTime: Joi.string().required(),
                closeTime: Joi.string().required(),
        })).required(),
        city: Joi.string().required(),
        buildingNumber: Joi.number().min(0).required(),
        floorNumber: Joi.number().min(0).required(),
        street: Joi.string().required(),
        consultationFess: Joi.number().min(0).required(),
    })
};

export const getClinicByIdSchema = {
    params:Joi.object({
        id:generalRules._id.required()
    }),
};

export const deleteClinicSchema={
    params:Joi.object({
        id:generalRules._id.required()
    }),
};

export const editClinicSchema = {
    params:Joi.object({
        id:generalRules._id.required()
    }),
    body: Joi.object({
        clinicName: Joi.string().min(4).optional(),
        number: Joi.string().optional(),
        workDays: Joi.array()
        .items(
            Joi.object({
                day: Joi.string()
                .valid("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
                .required(),
                openTime: Joi.string().required(),
                closeTime: Joi.string().required(),
        })).optional(),
        city: Joi.string().optional(),
        buildingNumber: Joi.number().min(0).optional(),
        floorNumber: Joi.number().min(0).optional(),
        street: Joi.string().optional(),
        consultationFess: Joi.number().min(0).optional(),
    })
};