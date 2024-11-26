import {Router} from "express"
import { auth, authorizationMiddleware, errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import * as controller from "./patient.controller.js";
import * as validation from "./patient.schema.js"
import { extensions, systemRoles } from "../../Utils/index.js";
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

patientRouter.get(
    "/getPatients",
    errorHandler(auth()),
    errorHandler(controller.getPatients)
);

patientRouter.get(
    "/get-info",
    errorHandler(auth()),
    errorHandler(controller.getInfo)
);

patientRouter.get(
    "/getPatient/:patientId",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.getPatientSchema)),
    errorHandler(controller.getPatient)
);

patientRouter.get(
    "/getBlockedPatients",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(controller.getBlockedPatients)
);

patientRouter.put(
    "/updatePatient",
    errorHandler(auth()),
    errorHandler(multerHost({ allowedExtensions:extensions.Images }).single("profilePic")),
    parseJSONField("address"),
    parseJSONField("listOfEmergency"),
    errorHandler(validationMiddleware(validation.updatePatientSchema)),
    errorHandler(controller.updateAccount)
);

export {patientRouter};