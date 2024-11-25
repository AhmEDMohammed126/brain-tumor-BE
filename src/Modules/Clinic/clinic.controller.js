import { Clinic } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {post} /clinics/addClinic Add Clinic
 */
export const addClinic =async (req, res) =>{
    const {country,city,buildingNumber,floorNumber,isDefault}=req.body
    const doctorId=req.authUser._id;
    const newClinic=new Clinic({
        doctorId,
        country,
        city,
        buildingNumber,
        floorNumber,
        isDefault:[true,false].includes(isDefault)? isDefault : false
    })
    // if(newClinic.isDefault){
    //     await Clinic.updateOne({userId,isDefault:true},{isDefault:false})
    // }
    const clinic=await newClinic.save();
    return res.status(201).json({clinic});
}
/**
 * @api {get} /clinics/getClinic Get all Clinics
 */
export const getAllClinics =async (req, res,next) =>{
    const {authUser}=req;
    const clinics=await Clinic.find({userId:authUser._id,isMarkedAsDeleted:false});
    if(!clinics){
        return next(
            new ErrorClass("ther is no clinics with this email", 400, "clinics not found")
        )
    }
    res.status(200).json({clinics});
}

/**
 * @api {get} /clinics/getClinic/:id Get Clinic by id
 */
export const getClinicById =async (req, res,next) =>{
    const {id}=req.params
    const clinic=await Clinic.findOne({_id:id,isMarkedAsDeleted:false});
    if(!clinic){
        return next(
            new ErrorClass("ther is no clinic", 400, "clinic not found")
        )
    }
    res.status(200).json({clinic});
}
/**
 * @api {patch} /clinics/softDeleteClinic/:id soft delete Clinic by id
 */
export const softDeleteClinic =async(req,res,next)=>{
    const userId =req.authUser._id;
    const {id}=req.params;
    const clinic=await Clinic.findOneAndUpdate(
        {_id:id,userId,isMarkedAsDeleted:false},
        {isMarkedAsDeleted:true},
        {new:true}
    );
    if(!clinic){
        return next(
            new ErrorClass("ther is no clinic", 400, "Clinic not found")
        )
    }
    res.status(200).json({message:"Clinic soft deleted"});
}
/**
 * @api {delete} /clinics/deleteClinic/:id Delete Clinic by id
 */
export const deleteClinic = async(req, res,next) => {
    const{id}=req.params;
    const {authUser}=req;
    const clinic=await Clinic.findOneAndDelete({userId:authUser._id,_id:id});
    if(!clinic){
        return next(
            new ErrorClass("ther is no Clinic", 400, "Clinic not found")
        )
    }
    res.status(200).json({message:"Clinic deleted"});
}
/**
 * @api {put} /clinics/edit/:id edit Clinic by id
 */
export const editClinic=async(req,res,next)=>{
    const{country,city,buildingNumber,floorNumber,isDefault}=req.body;
    const{id}=req.params;
    const userId=req.authUser._id;
    const clinic=await Clinic.findOne({_id:id,userId,isMarkedAsDeleted:false});
    if(!clinic){
        return next(
            new ErrorClass("ther is no clinic", 400, "clinic not found")
        )
    }
    if(country) clinic.country=country;
    if(city) clinic.city=city;
    if(buildingNumber) clinic.buildingNumber=buildingNumber;
    if(floorNumber) clinic.floorNumber=floorNumber;
    if(isDefault) clinic.isDefault=[true,false].includes(isDefault)? isDefault : false;
    
    await clinic.save();
    res.status(200).json({message:"clinic updated"});
}