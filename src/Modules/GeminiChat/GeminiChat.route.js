import {Router} from "express"
import { auth, authorizationMiddleware, errorHandler } from "../../Middlewares/index.js";
import * as controller from "./GeminiChat.controller.js";
import { extensions, systemRoles } from "../../Utils/index.js";

const GeminiChatRouter=Router();

GeminiChatRouter.post('/chat',
    auth(),
    controller.chat);


export {GeminiChatRouter};