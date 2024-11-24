import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const addReviewSchema={
    body: Joi.object({
        review: Joi.string().min(3).max(500).required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        doctorId: generalRules._id.required(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    })
};


export const getReviewsSchema = {
    params:Joi.object({
        doctorId: generalRules._id.required(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    })
};


export const approveOrRejectReviewSchema={
    params:Joi.object({
        reviewId: generalRules._id.required(),
    }),
    body: Joi.object({
        accept: Joi.boolean().optional(),
        reject: Joi.boolean().optional(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    })
}