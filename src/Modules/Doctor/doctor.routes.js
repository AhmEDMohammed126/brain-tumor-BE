import {Router} from "express"
import { errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import * as controller from "./doctor.controller.js";
import * as validation from "./doctor.schema.js"
import { extensions } from "../../Utils/index.js";
import { parseWorkDays } from "./Doctor.middleware/parseWorkDays.js";

const doctorRouter=Router();

doctorRouter.post(
    '/doctorRegister',
    errorHandler(multerHost({ allowedExtensions: [...extensions.Images, ...extensions.Documents] }).fields([
        { name: "profilePic", maxCount: 1 }, // Single image file
        { name: "certifications", maxCount: 1 },   // Single PDF file
    ])),
    parseWorkDays,
    errorHandler(validationMiddleware(validation.registerDoctorSchema)),
    errorHandler(controller.registerDoctor)
);

export {doctorRouter};