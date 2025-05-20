import express from "express";
import { config } from "dotenv";
import db_connection from "./DB/connection.js";
import { routerHandler } from "./router-handler.js";
import { cronHandler } from "./cronjobs-handler.js";
export const main= ()=>{

    config();
    const app = express();
    const port = process.env.PORT || 5000;

    //router handling
    routerHandler(app);

    //database connection
    db_connection();

    //cron jobs
    cronHandler();

    app.get("/", (req, res) => res.send("Hello World!"));

    const serverApp=app.listen(port, () => console.log(`Example app listening on port ${port}!`));

}