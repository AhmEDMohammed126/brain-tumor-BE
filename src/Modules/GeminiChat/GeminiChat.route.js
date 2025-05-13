import {Router} from "express"
import { auth} from "../../Middlewares/index.js";
import * as controller from "./GeminiChat.controller.js";


const GeminiChatRouter=Router();

GeminiChatRouter.post('/chat',
    auth(),
    controller.chat);


export {GeminiChatRouter};