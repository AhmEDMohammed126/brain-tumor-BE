import Joi from "joi";
import { generalRules ,systemRoles} from "../../Utils/index.js";

export const registeradminSchema ={
    body: Joi.object({
        firstName: Joi.string().min(2).max(20).required(),
        lastName: Joi.string().min(2).max(20).required(),
        email:  generalRules.email.required(),
        password: generalRules.password.required(),
        userType: Joi.string().valid(systemRoles.ADMIN).required(),
        gender: Joi.string().valid('male', 'female').required(),
        age: Joi.number().integer().min(16).max(100).required(),
        phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    })
};

export const verifySchema = {
    params: Joi.object({
        confirmationToken: Joi.string().required(),
    }),
};

export const forgetPassSchema ={
    body: Joi.object({
        email: generalRules.email.required(),
    }),
};

export const verifyForgetPasswordSchema ={
    body:Joi.object({
        otp: Joi.string().required()
    }) 
};

export const resetPasswordSchema = {
    body:Joi.object({
        email: generalRules.email.required(),
        password: generalRules.password.required()
    })
};

export const updatePasswordSchema = {
    body: Joi.object({
        oldPassword: generalRules.password.required(),
        password: generalRules.password.required(),
    }),
}

export const softDeleteUserSchema={
    body:Joi.object({
        email: generalRules.email.required()
    }),
}

export const unblockUserSchema = {
    body:Joi.object({
        email: generalRules.email.required()
    }),
};

export const DeleteUserSchema={
    body:Joi.object({
        email: generalRules.email.required()
    }),
    // headers: Joi.object({
    //     token: Joi.string().required(),
    //     ...generalRules.headers,
    // })
};

// export const updateSchema = {
//   body: Joi.object({
//     firstName: Joi.string().min(3).max(30).alphanum().optional(),
//     lastName: Joi.string().min(3).max(30).alphanum().optional(),
//     email:generalRules.email.optional(),
//     recoveryEmail:generalRules.email.optional(),
//     DOB:Joi.date().optional(),
//     phone:Joi.string().optional(),
//   }),
//   headers: Joi.object({
//     token: Joi.string().required(),
//     ...generalRules.headers,
//   }),
// };

// export const deleteSchema = {
//   headers: Joi.object({
//     token: Joi.string().required(),
//     ...generalRules.headers,
//   }),
// };

// export const getInfoSchema = {
//   headers: Joi.object({
//     token: Joi.string().required(),
//     ...generalRules.headers,
//   }),
// };

// export const getByIdSchema = {
//   headers: Joi.object({
//     token: Joi.string().required(),
//     ...generalRules.headers,
//   }),
//   params: generalRules.objectId,
// };


// export const updatePassSchema = {
//   body: Joi.object({
//     password: generalRules.password.required(),
//   }),
//   headers: Joi.object({
//     token: Joi.string().required(),
//     ...generalRules.headers,
//   }),
// };