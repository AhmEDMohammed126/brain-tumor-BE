import {Router} from "express"
import { auth, authorizationMiddleware, errorHandler, multerHost, validationMiddleware,parseJSONField } from "../../Middlewares/index.js";
import * as controller from "./medicalHistory.controllers.js";
import * as validation from "./medicalHistory.schema.js"
import { extensions, systemRoles } from "../../Utils/index.js";

const medicalHistoryRouter=Router();

medicalHistoryRouter.post(
    '/createMedicalHistory',
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT])),
    errorHandler(multerHost({ allowedExtensions: [...extensions.Documents] }).fields([{ name: "medicalDocuments", maxCount: 3 }])),
    parseJSONField(["chronicDiseases","allergy","pastSurgeries","familyHistory","medication","lifeStyle"]),
    errorHandler(validationMiddleware(validation.createMedicalHistorySchema)),
    errorHandler(controller.createMedicalHistory)
);

export {medicalHistoryRouter};