import { scheduleJob } from "node-schedule";
import {Doctor, Review } from "../../DB/Models/index.js";
import { ReviewStatus } from "./enums.utils.js";
//this function must be called in index.js 
export const doctorRatingCron=()=>{
    scheduleJob('* * * * * *',async()=>{
        const approvedReviews=await Review.find({reviewStatus:ReviewStatus.APPROVED});

        for(const approvedReview of approvedReviews){
            const doctor=await Doctor.findById(approvedReview.doctorId);
            const doctorReview=approvedReviews.filter(review=>review.doctorId.toString()===doctor._id.toString());
            if(doctorReview.length===0){
                continue;
            }else{
                let totalRating=0;
                for(const review of doctorReview){
                    totalRating+=review.rating;
                }
                const avgRting=Number(totalRating/doctorReview.length).toFixed(2);
                doctor.rating=avgRting;
                await doctor.save();
            }
        }
    });
}