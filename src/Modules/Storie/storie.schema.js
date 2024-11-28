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
}