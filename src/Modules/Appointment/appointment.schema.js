import Joi from "joi";
import { AppointmentStatus, AppointmentType,generalRules } from "../../Utils/index.js";

export const bookAppointmentSchema={
    body: Joi.object({
        
        doctorId:generalRules._id.required(), 
        clinicId:generalRules._id.required(), 
        type:Joi.string().valid(...Object.values(AppointmentType)).required(),
        date:Joi.date().min(new Date().setHours(0, 0, 0, 0)).required(),
        time:Joi.string().required(),
        viewConsent:Joi.boolean().optional(),
        addConsent:Joi.boolean().optional()
    })
};

export const getAppointmentByIdSchema={
    params:Joi.object({
        appointmentId:generalRules._id.required()
    }),
};

export const getAppointmentsSchema={
    query:Joi.object({
        page: Joi.number().default(1),
        limit: Joi.number().default(10),
        doctorId:generalRules._id.optional(),
        clinicId: generalRules._id.optional(),
        patientId: generalRules._id.optional(),
        date: Joi.date().optional(),
        type: Joi.string().valid(...Object.values(AppointmentType)).optional(),
        status: Joi.string().valid(...Object.values(AppointmentStatus)).optional(),
        time: Joi.string().optional(),

    }),
};

export const updateAppointmentStatusSchema={
    params:Joi.object({
        appointmentId:generalRules._id.required()
    }),
    body:Joi.object({
        status:Joi.string().valid(...Object.values(AppointmentStatus)).optional(),
    })
};

export const cancelAppointmentSchema={
    params:Joi.object({
        appointmentId:generalRules._id.required()
    })
};

export const updateConsentStatusSchema={
    params:Joi.object({
        doctorId:generalRules._id.required()
    }),
    body:Joi.object({
        viewConsent:Joi.boolean().optional(),
        addConsent:Joi.boolean().optional(),
    })
};