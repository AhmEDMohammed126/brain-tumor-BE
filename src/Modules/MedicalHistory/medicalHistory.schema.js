import Joi from 'joi';
import { generalRules } from "../../Utils/index.js";

export const createMedicalHistorySchema = {
  body: Joi.object({
    allergy: Joi.array().items(
      Joi.object({
        allergyName: Joi.string().required(),
      })
    ).optional(),
    weight: Joi.number().min(0).max(300).optional(),
    bloodType: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").optional(),
    height: Joi.number().min(0).max(300).optional(),
    chronicDiseases: Joi.array().items(
      Joi.object({
        chronicName: Joi.string().required(),
      })
    ).optional(),
  
    pastSurgeries: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        date: Joi.date().iso().required(),
        notes: Joi.string().allow('')
      })
    ).optional(),
  
    familyHistory: Joi.array().items(
      Joi.object({
        relation: Joi.string().required(),
        condition: Joi.string().required(),
        age: Joi.number().integer().min(0).max(120)
      })
    ).optional(),
  
    medication: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        frequency: Joi.string().required()
      })
    ).optional(),
    lifeStyle: Joi.array().items(Joi.string()).optional()
  }).options({ abortEarly: false })  
}

export const addToMedicalHistorySchema = {
  params: Joi.object({
    patientId: generalRules._id.required(),
  }),
  body: Joi.object({
    allergy: Joi.array().items(
      Joi.object({
        allergyName: Joi.string().required(),
      })
    ).optional(),

    chronicDiseases: Joi.array().items(
      Joi.object({
        chronicName: Joi.string().required(),
      })
    ).optional(),

    pastSurgeries: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        date: Joi.date().iso().required(),
        notes: Joi.string().allow('')
      })
    ).optional(),

    familyHistory: Joi.array().items(
      Joi.object({
        relation: Joi.string().required(),
        condition: Joi.string().required(),
        age: Joi.number().integer().min(0).max(120)
      })
    ).optional(),

    medication: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        frequency: Joi.string().required()
      })
    ).optional(),

    lifeStyle: Joi.array().items(Joi.string()).optional(),

    weight: Joi.object({
  value: Joi.number().min(0).max(250).required()
}).optional(),

height: Joi.object({
  value: Joi.number().min(0).max(250).required()
}).optional(),

bloodType: Joi.object({
  value: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required()
}).optional(),

  }).options({ abortEarly: false })
}
