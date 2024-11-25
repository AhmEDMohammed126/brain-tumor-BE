import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const addClinicSchema ={
    body: Joi.object({
        country: Joi.string().min(2).max(20).required(),
        city: Joi.string().min(2).max(20).required(),
        buildingNumber: Joi.number().integer().min(0).required(),
        floorNumber: Joi.number().integer().min(0).max(100).required(),
        addressLable: Joi.string().required(),
        isDefault:Joi.boolean(),
    })
};

export const getAllClinicSchema = {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
};

export const getClinicByIdSchema = {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
};

export const softDeleteClinicSchema={
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
};

export const deleteClinicSchema={
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
};


export const editClinicSchema = {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
    body: Joi.object({
        country: Joi.string().min(4).max(25).alphanum().optional(),
        city: Joi.string().min(3).max(25).alphanum().optional(),
        buildingNumber: Joi.number().integer().min(0),
        floorNumber: Joi.number().integer().min(0).max(100),
        isDefault: Joi.boolean(),
    }),
};