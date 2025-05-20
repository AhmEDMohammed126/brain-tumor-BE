import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const addStorieSchema={
    body: Joi.object({
        storie: Joi.string().min(100).required(),
    })
};

export const getStorieSchema={
    params:Joi.object({
        id:generalRules._id.required(),
    })
};

export const getPatientStoriesSchema={
    params:Joi.object({
        id: generalRules._id.required(),
    })
};

export const acceptOrRejectStorieSchema={
    params:Joi.object({
        id: generalRules._id.required(),
    }),
    body: Joi.object({
        accept: Joi.boolean().optional(),
        reject: Joi.boolean().optional(),
    })
};

export const deleteStorieSchema={
    params:Joi.object({
        id: generalRules._id.required(),
    })
};

export const editStorieSchema={
    params:Joi.object({
        id: generalRules._id.required(),
    }),
    body: Joi.object({
        storie: Joi.string().min(50).required(),
    })
};