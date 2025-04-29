import { scheduleJob } from "node-schedule";
import {Appointment, Doctor, Review } from "../../DB/Models/index.js";
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

//cron for appointment status
export const updateAppointmentStatus=()=>{
    scheduleJob('0 0 * * *', async () => {
        console.log(' Checking yesterday\'s appointments...');
        const now = new Date();
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(yesterdayStart.getDate() -1 );
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        
        yesterdayEnd.setHours(23, 59, 59, 999);
        
        try {
            const result = await Appointment.updateMany(
                {
                    date: { $gte: yesterdayStart, $lte: yesterdayEnd },
                    status: { $in: ['pending', 'confirmed'] }
                },
                { $set: { status: 'ignored' } }
            );
            console.log(`✅ ${result.modifiedCount} appointments marked as 'IGNORED'`);
            } catch (err) {
                console.error('❌ Error updating appointments:', err);
        }
    });
}
