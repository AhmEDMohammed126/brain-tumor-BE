import { Clinic } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {post} /clinics/addClinic Add Clinic
 */
export const addClinic =async (req, res) =>{
    const {clinicName,number,workDays,city,buildingNumber,floorNumber,street,consultationFess}=req.body;
    const doctorId=req.authUser._id;
    const newClinic=new Clinic({
        doctorId,
        clinicName,
        number,
        workDays,
        city,
        street,
        buildingNumber,
        floorNumber,
        consultationFess
    });

    const clinic=await newClinic.save();
    return res.status(201).json({clinic});
}
/**
 * @api {get} /clinics/getClinic Get all Clinics
 */
export const getAllClinics =async (req, res,next) =>{
    const {authUser}=req;
    const clinics=await Clinic.find({doctorId:authUser._id});
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
    const clinic=await Clinic.findOne({_id:id});
    if(!clinic){
        return next(
            new ErrorClass("ther is no clinic", 400, "clinic not found")
        )
    }
    res.status(200).json({clinic});
}
/**

/**
 * @api {delete} /clinics/deleteClinic/:id Delete Clinic by id
 */
export const deleteClinic = async(req, res,next) => {
    const{id}=req.params;
    const {authUser}=req;
    isTherAppointments=await Appointment.findOne({clinicId:id,status:"confirmed"});
    if(isTherAppointments){
        return next(
            new ErrorClass("ther is appointments in this clinic", 400, "ther is appointments in this clinic")
        )
    }
    const clinic=await Clinic.findOneAndDelete({doctorId:authUser._id,_id:id});
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
    const{clinicName,number,workDays,city,buildingNumber,floorNumber,street,consultationFess}=req.body;
    const{id}=req.params;
    const doctorId=req.authUser._id;
    const clinic=await Clinic.findOne({_id:id,doctorId});
    if(!clinic){
        return next(
            new ErrorClass("ther is no clinic", 400, "clinic not found")
        )
    }
    //update data for clinic
    if(clinicName) clinic.clinicName=clinicName;
    if(number) clinic.number=number;
    if(workDays) clinic.workDays=workDays;
    if(city) clinic.city=city;
    if(street) clinic.street=street;
    if(buildingNumber) clinic.buildingNumber=buildingNumber;
    if(floorNumber) clinic.floorNumber=floorNumber;
    if(consultationFess) clinic.consultationFess=consultationFess;
    
    await clinic.save();
    res.status(200).json({message:"clinic updated"});
}