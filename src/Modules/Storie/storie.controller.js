import { Storie } from "../../../DB/Models/index.js";
import { ApiFeatures, ErrorClass, ReviewStatus } from "../../Utils/index.js";

/**
 * @api {post} /stories/addStorie Create a new storie
 */
export const addStorie = async (req, res, next) => {
    const userId = req.authUser._id;
    const { storie } = req.body;
    //add a new storie
    const newStory = await Storie.create({ userId, storie });
    
    res.status(201).json({message:"Story created",newStory});
};

/**
 * @api {get} /stories/getStories Get all approved Stories
 * @returns {object} return response { data}
 * @description get all approved stories
 */
export const getStories = async (req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    req.query.status = ReviewStatus.APPROVED;
    const model = Storie;
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        { path: "userId", select: "firstName lastName email _id profilePic" }
    ])
    .pagination()
    .filter()
    .sort();

    const stories = await ApiFeaturesInstance.mongooseQuery;
    if (!stories) {
        return next(
            new ErrorClass("No stories found", 404, "stories not found")
        );
    }
    res.status(200).json({stories});
};

/**
 * @api {get} /stories/getStorie/:id Get a Storie by id
 * @returns {object} return response {data}
 * @description get a specific storie
 */

export const getStorie = async (req, res, next) => {
    const { id } = req.params;
    const story = await Storie.findById(id).populate(
        [
        {
            path:"userId",
            select:"firstName lastName email -_id"
        }
        ]
    );
    if(!story){
        return next(
            new ErrorClass("there is no story", 400, "story not found")
        )
    }
    res.status(200).json({story});
};

/**
 * @api {get} /stories/patientsories/:patientId 
 * @returns {object} return response { data}
 * @description get all stories of  specific patient
 */

export const getPatientStories = async (req, res, next) => {
    const { id } = req.params;
    const stories = await Storie.find({userId:id}).populate(
        [
        {
            path:"userId",
            select:"firstName lastName email -_id"
        }
        ]
    );

    if(!stories){
        return next(
            new ErrorClass("there is no stories", 400, "stories not found")
        )
    }
    res.status(200).json({stories});
};

/**
 * @api {get}stories/pendingStories Get all pending stories
 * @returns {object} return response { data}
 * @description get all pending stories
*/

export const getPendingStories = async (req, res, next) => {
    const {page=1,limit=2,sort,...filters}=req.query;
    //find stories
    req.query.status= ReviewStatus.PENDING;
    const model = Storie;
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        { path: "userId", select: "firstName lastName email -_id profilePic" }
    ])
    .pagination()
    .filter()
    .sort();

    const stories = await ApiFeaturesInstance.mongooseQuery;
    
    if (!stories) {
        return next(
            new ErrorClass("No stories found", 404, "stories not found")
        );
    }
    res.status(200).json({stories});
}
/**
 * @api {put}stories/acceptOrRejectStorie/:id Accept or reject a Storie by id
 * @returns {object} return response {message}
 * @description This method is used to handle the request to accept or reject a Storie
 */

export const acceptOrRejectStorie = async (req, res, next) => {
    const { id } = req.params;
    const { accept,reject } = req.body;
    if(accept && reject){
        return next(new ErrorClass ("You can't accept and reject at the same time", 400,"You can't accept and reject at the same time"));
    }
    const story = await Storie.findOne({_id:id});
    if (!story) {
        return next(
            new ErrorClass("there is no story", 400, "story not found")
        );
    }
    
    if (accept) {
        story.status = ReviewStatus.APPROVED;
    }
    if (reject) {
        story.status = ReviewStatus.REJECTED;
    }
    await story.save();
    res.status(200).json({ message: `Story status updated to ${story.status}` });
};

/**
 * @api {delete}stories/deleteStorie/:id Delete a Storie by id
 * @returns {object} return response {message}
 * @description delete a specific storie
 */

export const deleteStorie = async (req, res, next) => {
    const userId =req.authUser._id;
    const { id } = req.params;
    //delete story of the patient
    const story= await Storie.findOneAndDelete({userId:userId,_id:id});
    if(!story){
        return next(
            new ErrorClass("there is no story", 400, "story not found")
        )
    }
    res.status(200).json({message:"Story deleted"});
};

/**
 * @api {put} stories/editStorie/:id Edit a Storie by id
 * @returns {object} return response {message, data}
 * @description edit a specific storie
 */

export const editStorie = async (req, res, next) => {
    const userId =req.authUser._id;
    const { id } = req.params;
    const {storie} = req.body;
    //edit story of the patient
    const story= await Storie.findOneAndUpdate({userId:userId,_id:id},{$set:{storie:storie}},{new:true});
    if(!story){
        return next(
            new ErrorClass("there is no story", 400, "story not found")
        )
    }
    res.status(200).json({message:"Story updated",data:story});
};