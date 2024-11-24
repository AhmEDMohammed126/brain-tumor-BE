import { doctorRatingCron } from "./src/Utils/crons.uitls.js";
import { gracefulShutdown } from "node-schedule";

export const cronHandler=()=>{
    //cron jobs
    doctorRatingCron();
    //gracefulShutdown();
}