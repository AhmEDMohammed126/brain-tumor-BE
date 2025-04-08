import {Router} from "express"
import { auth, authorizationMiddleware, errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import * as controller from "./encounter.controllers.js";
import * as validation from "./encounter.schema.js"
import { extensions, systemRoles } from "../../Utils/index.js";

const encounterRouter=Router();

encounterRouter.post("/createEncounter",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.createEncounterSchema)),
    errorHandler(controller.createEncounter)
);

encounterRouter.get("/getEncounter",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR, systemRoles.PATIENT])),
    errorHandler(validationMiddleware(validation.getEncounterSchema)),
    errorHandler(controller.getEncounter)
);

export {encounterRouter};