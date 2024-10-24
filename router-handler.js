import { json } from "express";
import cors from "cors";
import * as router from "./src/Modules/index.js";
import { globaleResponse } from "./src/Middlewares/index.js";


export const routerHandler = (app) => {
    //Route handling
    app.use(cors());//to give access to frontend routes and routes that require authorization to access routes in back-end
    app.use(json());

    //REST-API
    app.use("/users",router.userRouter)
    
    app.use("*",(req,res,next)=>
        res.status(404).json({message:"Route Not Found"})
    );

    app.use(globaleResponse);

}