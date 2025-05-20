import Joi from "joi";
import { generalRules } from "../../Utils/index.js";

export const createEncounterSchema = {
    body: Joi.object({
        patientId: generalRules._id.required(),
        appointmentId: generalRules._id.required(),
        complaint: Joi.string().optional(),
        diagnosis: Joi.array().items(
            Joi.object({
            diagnoseName: Joi.string().optional(),
            diagnoseInfo: Joi.string().optional()
            })
    ),
    medications: Joi.array().items(
        Joi.object({
        name: Joi.string().optional(),
        dosage: Joi.string().optional(),
        frequency: Joi.string().optional(),
        })
    ),
    orders: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
    })
};

export const getEncounterSchema={
    query:Joi.object({
        page: Joi.number().default(1),
        limit: Joi.number().default(10),
        _id:generalRules._id.optional(),
        doctorId:generalRules._id.optional(),
        appointmentId: generalRules._id.optional(),
        patientId: generalRules._id.optional(),
    })
};

export const updateEncounterSchema={
    params:Joi.object({
        encounterId:generalRules._id.required(),
    }),
    body:Joi.object({
        diagnosis: Joi.array().items(
            Joi.object({
            diagnoseName: Joi.string().optional(),
            diagnoseInfo: Joi.string().optional()
            })
    ),
    medications: Joi.array().items(
        Joi.object({
        name: Joi.string().optional(),
        dosage: Joi.string().optional(),
        frequency: Joi.string().optional(),
        })
    ),
    complaint: Joi.string().optional(),
    orders: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
    })
}
