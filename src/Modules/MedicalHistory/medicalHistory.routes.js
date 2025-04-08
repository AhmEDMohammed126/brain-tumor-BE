import {Router} from "express"
import { auth, authorizationMiddleware, errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import * as controller from "./medicalHistory.controllers.js";
import * as validation from "./medicalHistory.schema.js"
import { extensions, systemRoles } from "../../Utils/index.js";

const medicalHistoryRouter=Router();

export {medicalHistoryRouter};