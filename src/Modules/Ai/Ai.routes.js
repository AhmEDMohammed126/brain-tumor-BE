import {Router} from "express"
import { auth, errorHandler, multerHost,} from "../../Middlewares/index.js";
import * as controller from "./Ai.controller.js";
import { extensions } from "../../Utils/index.js";


const AIRouter=Router();

AIRouter.post('/predict',
    auth(),
    errorHandler(multerHost({ allowedExtensions:extensions.Images }).single("image")),
    controller.predict
);

export {AIRouter};