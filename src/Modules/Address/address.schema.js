import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const addAddressSchema ={
    body: Joi.object({
        country: Joi.string().min(2).max(20).required(),
        city: Joi.string().min(2).max(20).required(),
        buildingNumber: Joi.number().integer().min(0).required(),
        floorNumber: Joi.number().integer().min(0).max(100).required(),
        addressLable: Joi.string().required(),
        isDefault:Joi.boolean(),
    })
};

export const getAllAddressesSchema = {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
};

export const getAddressByIdSchema = {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
};

export const softDeleteAddressSchema={
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
};

export const deleteAddressSchema={
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        id:generalRules._id.required()
    }),
};


export const editAddressScheme = {
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
        addressLable: Joi.string().alphanum().optional(),
        isDefault: Joi.boolean(),
    }),
};