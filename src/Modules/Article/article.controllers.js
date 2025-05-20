import { nanoid } from "nanoid";
import { Article  } from "../../../DB/Models/index.js";
import { ApiFeatures, ErrorClass, uploadFile } from "../../Utils/index.js";
/**
 * @api {post} articles/addArticle
 * @returns return response {message, data}
 * @description Adds a new Article 
 */

export const addArticle = async (req, res, next) => {  
    const doctorId =req.authUser._id;
    const { title, content} = req.body;
    const URLs=[];
    let customId;
    if(req.files.length > 0){
        customId = nanoid(4);
        const folder = `${process.env.UPLOADS_FOLDER}/Doctor/${doctorId}/Articles/${customId}`;
        for (const file of req.files) {
            const{secure_url,public_id}=await uploadFile({
                file: file.path,
                folder
            });
            URLs.push({secure_url,public_id});
        }
    };
    const newArticle = new Article({
        title,
        content,
        doctorId,
        Images: {
            URLs,
            customId
        }
    });

    await newArticle.save();
    res.status(201).json({ message: "Article added successfully", data: newArticle });
}

/**
 * @api {get} /articles/getArticles 
 * - GET all articles or can be filtered by send doctorId to get articels of specific doctor
 */
export const getArticles = async (req, res, next) => {
    const { page=1, limit=2, sort,...filters } = req.query;
    const model = Article;
    const ApiFeaturesInstance = new ApiFeatures(model, req.query,
        [
            { 
                path: "doctorId", 
                select: "firstName lastName _id",
                match: {isMarkedAsDeleted:false} 
            }
        ]
    )
    .pagination()
    .filter()
    .sort();

    const articles = await ApiFeaturesInstance.mongooseQuery;

    if(!articles)
        return next(
                new ErrorClass("No articles", 400 ,"Not Found")
            );

    res.status(200).json({ message: "All articles", data: articles });
}

/**
 * @api {get} /articles/getArticle - GET article 
 */

export const getArticle = async (req, res, next) => {
    const { id } = req.params;
    const article = await Article.findById(id).populate(
        [
            {
                path: "doctorId",
                select: "firstName lastName _id",
                match: {isMarkedAsDeleted:false}
            }
        ]
    ).select('-__v');
    
    if(!article)
        return next(
                new ErrorClass("No article found", 404 ,"Not Found")
            );

    res.status(200).json({ message: "Article", data: article });
}

/**
 * @api {put} /articles/updateArticle/:id
 * @returns return response {message, data}
 * @description Update an existing article
 */

export const updateArticle = async (req, res, next) => {
    const doctorId =req.authUser._id;
    const { id } = req.params;
    const {title , content ,public_id} = req.body;
    const article = await Article.findOne({_id:id,doctorId:doctorId});
    if(!article)
        return next(
                new ErrorClass("No article found", 404 ,"Not Found")
            );

    //update exist image or add new images 
    if(public_id&&req.files.length){
        //update the existing image
        const splitedPublicId = public_id.split(`${article.Images.customId}/`)[1];
        const { secure_url } = await uploadFile({
            file: req.files[0].path,
            folder: `${process.env.UPLOADS_FOLDER}/Doctor/${doctorId}/Articles/${article.Images.customId}`,
            publicId: splitedPublicId,
        });
        if(article.Images.URLs.length==1){
            article.Images.URLs[0].secure_url=secure_url    
        }
        article.Images.URLs.forEach((url)=>{
            if(url.public_id===public_id){
                url.secure_url=secure_url
            }
        });
        //check if new images are available with update of image
        if(req.files[1]){
            const folder =`${process.env.UPLOADS_FOLDER}/Doctor/${doctorId}/Articles/${article.Images.customId}`;
            const URLs=[];
            for(let i=1; i<req.files.length; i++){
                const{secure_url,public_id}=await uploadFile({
                    file:req.files[i].path,
                    folder
                });
                URLs.push({secure_url,public_id});
        }
            article.Images.URLs.push(...URLs)
        }
    }
    //add new images
    else if(req.files.length){  
        if(!article.Images.customId) {
            const newcustomId = nanoid(4);
            article.Images.customId=newcustomId;
        }
        const folder =`${process.env.UPLOADS_FOLDER}/Doctor/${doctorId}/Articles/${article.Images.customId}`;
        const URLs=[]
        for (const file of req.files) {
            const{secure_url,public_id}=await uploadFile({
                file: file.path,
                folder
            })
            URLs.push({secure_url,public_id})
        }
        article.Images.URLs.push(...URLs)   
    }

    if(title) article.title = title;
    if(content) article.content = content;
    const newArticle = await article.save();
    res.status(200).json({ message: "Article updated successfully", data: newArticle });
};

/**
 * @api {delete} /articles/deleteArticle/:id
 * @returns return response {message, data}
 * @description Delete an existing article
 */

export const deleteArticle = async (req, res, next) => {
    const doctorId =req.authUser._id;
    const { id } = req.params;
    const article = await Article.findOneAndDelete({_id:id,doctorId:doctorId});
    if(!article)
        return next(
                new ErrorClass("No article found", 404 ,"Not Found")
            );
    res.status(200).json({ message: "Article deleted successfully", data: article });
};