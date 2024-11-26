import {Router} from "express"
import { errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import * as controller from "./patient.controller.js";
import * as validation from "./patient.schema.js"
import { extensions } from "../../Utils/index.js";
import { parseJSONField } from "../../Middlewares/parseJSONField .js";

const patientRouter=Router();

patientRouter.post(
    '/patientRegister',
    errorHandler(multerHost({ allowedExtensions:extensions.Images }).single("profilePic")),
    parseJSONField("address"),
    parseJSONField("listOfEmergency"),
    errorHandler(validationMiddleware(validation.registerPatientSchema)),
    errorHandler(controller.registerPatient)
);

patientRouter.get(
    "/confirmation/:confirmationToken",
    errorHandler(validationMiddleware(validation.verifySchema)),
    errorHandler(controller.verifyEmail)
);
export {patientRouter};