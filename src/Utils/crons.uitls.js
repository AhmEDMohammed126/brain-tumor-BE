import { scheduleJob } from "node-schedule";
import { Coupon, Product, Review } from "../../DB/Models/index.js";
import { DateTime } from "luxon";
import { ReviewStatus } from "./enums.utils.js";
//this function must be called in index.js 
export const cronJobOne=()=>{
    scheduleJob('0 59 23 * * *',async()=>{
    })
}

export const productRatingCron=()=>{
    scheduleJob('* * * * * *',async()=>{
        // const approvedReviews=await Review.find({reviewStatus:ReviewStatus.APPROVED});

        // for(const approvedReview of approvedReviews){
        //     const product=await Product.findById(approvedReview.productId);
        //     const productReview=approvedReviews.filter(review=>review.productId.toString()===product._id.toString());
        //     if(productReview.length===0){
        //         continue;
        //     }else{
        //         let totalRating=0;
        //         for(const review of productReview){
        //             totalRating+=review.rating;
        //         }
        //         const avgRting=Number(totalRating/productReview.length).toFixed(2);
        //         product.rating=avgRting;
        //         await product.save();
        //     }
        // }
    });
}