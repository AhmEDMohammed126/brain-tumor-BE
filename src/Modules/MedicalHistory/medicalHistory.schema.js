import Joi from 'joi';

export const createMedicalHistorySchema = Joi.object({
  allergy: Joi.array().items(
    Joi.object({
      allergyName: Joi.string().required(),
      severity: Joi.string().valid('Mild', 'Moderate', 'Severe').default('Moderate')
    }).optional()
  ).optional(),

  chronicDiseases: Joi.array().items(
    Joi.object({
      chronicName: Joi.string().required(),
      diagnosedDate: Joi.date().iso()
    }).optional()
  ).optional(),

  pastSurgeries: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      date: Joi.date().iso().required(),
      notes: Joi.string().allow('')
    }).optional()
  ).optional(),

  familyHistory: Joi.array().items(
    Joi.object({
      relation: Joi.string().required(),
      condition: Joi.string().required(),
      age: Joi.number().integer().min(0).max(120)
    }).optional()
  ).optional(),

  medication: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      dosage: Joi.string().required(),
      frequency: Joi.string().required()
    }).optional()
  ).optional(),
  lifeStyle: Joi.array().items(Joi.string()).optional()
}).options({ abortEarly: false });