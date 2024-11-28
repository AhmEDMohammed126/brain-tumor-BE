import { Doctor,Review } from "../../../DB/Models/index.js";
import { ErrorClass, ReviewStatus } from "../../Utils/index.js";

/**
 * @api {post} /reviews/addReview Add review
 */
//TODO: not test until booking model  and controller finished
export const addReview=async(req, res, next) => {
    const userId = req.authUser._id;
    const { doctorId,rating,review } = req.body;

    //check if patient has already reviewed the doctor
    const reviewExist = await Review.findOne({ userId, doctorId });
    if (reviewExist) {
        return next(new ErrorClass ("You already reviewed this Doctor", 400,"You already reviewed this Doctor"));
    }

    //check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return next(new ErrorClass ("No doctor found", 404,"No doctor found"));
    };
    //check if patient go to the patients in doctor model
    const patientVistDoctor = await Doctor.findOne({ doctorId, "patients.patientId": userId });
    if(!patientVistDoctor){
        return next(new ErrorClass ("You must visit the doctor to leave a review", 400,"You must visit the doctor to leave a review"));
    }
    const reviewInstance = new Review({
        userId,
        doctorId,
        rating,
        review
    })
    await reviewInstance.save();
    res.status(201).json({review:reviewInstance});
}

/**
 * @api {get} /reviews/listPendingReviews list Pending Reviews
 */

export const listPendingReviews=async(req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    //find docters
    req.query.reviewStatus= ReviewStatus.PENDING;
    const model = Review;
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        {
            path:"userId",
            select:"firstName lastName email -_id"
        },
        {
            path:"doctorId",
            select:"firstName lastName rating -_id"
        }
    ])
    .pagination()
    .filter()
    .sort();

    const reviews = await ApiFeaturesInstance.mongooseQuery;

    res.status(200).json({ reviews });
}

/**
 * @api {get} /reviews/getReviews/:doctorId get doctor reviews
 */

export const getReviews=async(req, res, next) => {

    const doctorId = req.params.doctorId;
    const reviews = await Review.find({ doctorId, reviewStatus:ReviewStatus.APPROVED }).populate(
        [
            {
                path:"userId",
                select:"firstName lastName email -_id"
            }
        ]
    );
    if(reviews.length==0){
        return next(new ErrorClass ("No reviews found", 404,"No reviews found"));
    }
    res.status(200).json({ reviews });
}

/**
 * @api {patch} /reviews/approveOrRejectReview/:reviewId  approve or reject review
 */
export const approveOrRejectReview =async (req, res, next) => {
    const { reviewId } = req.params;
    const actionDoneBy=req.authUser._id;
    const { accept , reject } = req.body;
    if(accept && reject){
        return next(new ErrorClass ("You can't accept and reject at the same time", 400,"You can't accept and reject at the same time"));
    }
    const review = await Review.findOne({_id:reviewId});
    if (!review) {
        return next(new ErrorClass ("Review not found", 404,"Review not found"));
    }
    if (accept) {
        review.reviewStatus = ReviewStatus.APPROVED;
    }
    if (reject) {
        review.reviewStatus = ReviewStatus.REJECTED;
    }
    review.actionDoneBy=actionDoneBy;
    await review.save();
    res.status(200).json({ review });
}
