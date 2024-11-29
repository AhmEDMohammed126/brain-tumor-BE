import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const addArticleSchema={
    body: Joi.object({
        title: Joi.string().min(10).max(255).required(),
        content: Joi.string().min(100).required(),
    })
};

export const getArticleSchema={
    params: Joi.object({
        id: generalRules._id.required()
    }),
};

export const updateArticleSchema={
    params: Joi.object({
        id: generalRules._id.required()
    }),
    body: Joi.object({
        title: Joi.string().min(10).max(255).optional(),
        content: Joi.string().min(100).optional(),
        public_id: Joi.string().optional(),
    }),
};

export const deleteArticleSchema={
    params: Joi.object({
        id: generalRules._id.required()
    }),
};