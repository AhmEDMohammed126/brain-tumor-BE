import Joi from "joi";
import { AppointmentStatus, AppointmentType,generalRules } from "../../Utils/index.js";

export const bookAppointmentSchema={
    body: Joi.object({
        
        doctorId:generalRules._id.required(), 
        clinicId:generalRules._id.required(), 
        type:Joi.string().valid(...Object.values(AppointmentType)).required(),
        date:Joi.date().greater(Date.now()).required(),
        time:Joi.number().required(),
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
        status: Joi.string().valid('pending', 'accepted', 'rejected').optional(),
        time: Joi.number().optional(),

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