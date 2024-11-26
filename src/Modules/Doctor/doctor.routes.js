import {Router} from "express"
import { auth, authorizationMiddleware, errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import * as controller from "./doctor.controller.js";
import * as validation from "./doctor.schema.js"
import { extensions, systemRoles } from "../../Utils/index.js";
import { parseJSONField } from "../../Middlewares/parseJSONField .js";

const doctorRouter=Router();

doctorRouter.post(
    '/doctorRegister',
    errorHandler(multerHost({ allowedExtensions: [...extensions.Images, ...extensions.Documents] }).fields([
        { name: "profilePic", maxCount: 1 }, // Single image file
        { name: "certifications", maxCount: 1 },   // Single PDF file
    ])),
    parseJSONField("workDays"),
    errorHandler(validationMiddleware(validation.registerDoctorSchema)),
    errorHandler(controller.registerDoctor)
);

doctorRouter.get(
    "/confirmation/:confirmationToken",
    errorHandler(validationMiddleware(validation.verifySchema)),
    errorHandler(controller.verifyEmail)
);

doctorRouter.get(
    "/getDoctors",
    errorHandler(auth()),
    errorHandler(controller.getDoctors)
);

doctorRouter.get(
    "/get-info",
    errorHandler(auth()),
    errorHandler(controller.getInfo)
);

doctorRouter.get(
    "/getDoctor/:doctorId",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.getDoctorSchema)),
    errorHandler(controller.getDoctor)
);

doctorRouter.get(
    "/getBlockedDoctors",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(controller.getBlockedDoctors)
);

doctorRouter.put(
    "/updateDoctor",
    errorHandler(auth()),
    errorHandler(multerHost({ allowedExtensions: [...extensions.Images,...extensions.Documents] }).fields([
        { name: "profilePic", maxCount: 1 }, // Single image file
        { name: "certifications", maxCount: 1 },   // Single PDF file
    ])),
    errorHandler(validationMiddleware(validation.updateDoctorSchema)),
    errorHandler(controller.updateAccount)
);

doctorRouter.get(
    "/getRequestedDoctors",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(controller.getRequestedDoctors)
);

doctorRouter.patch(
    "/approveOrRejectRequest/:doctorId",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(validationMiddleware(validation.approveOrRejectRequestSchema)),
    errorHandler(controller.approveOrRejectRequest)
);

export {doctorRouter};