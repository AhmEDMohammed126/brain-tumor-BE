import { nanoid } from "nanoid";
import { Appointment, MedicalHistory } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { uploadFile } from "../../Utils/cloudinary.utils.js";

//create medical history

export const createMedicalHistory = async (req, res, next) => {
    const { allergy, chronicDiseases, pastSurgeries, familyHistory, medication, lifeStyle } = req.body;
    const patientId = req.authUser._id;

    // Check for existing medical history
    const existingMedicalHistory = await MedicalHistory.findOne({ patientId });
    if (existingMedicalHistory) {
        return next(new ErrorClass("Medical history already exists for this patient", 400, "DUPLICATE_ENTRY"));
    }
        const pdfFile = req.files?.medicalDocuments?.[0];
        if(!pdfFile)return next(new ErrorClass('Please upload a pdf',400,'Please upload a pdf'));
        const customId = nanoid(4);
        const { secure_url , public_id  } = await uploadFile({
                file: pdfFile.path,
                folder: `${process.env.UPLOADS_FOLDER}/MedicalHistory/medicalDocuments/${customId}`,
                resource_type: 'raw',
            });
  // Build medical history object
    const medicalHistoryInstance = new MedicalHistory({
        patientId,
        allergy: allergy?.map(item => ({
            ...item,
            addedById: patientId,
            addedByRole: "Patient",
        })),
        chronicDiseases: chronicDiseases?.map(item => ({
            ...item,
            addedById: patientId,
            addedByRole: "Patient",
        })),
        pastSurgeries,
        familyHistory: familyHistory?.map(item => ({
            ...item,
        })),
        medicalDocuments:[
            { customId,secure_url , public_id  }
        ],
        medication: medication?.map(item => ({
            ...item,
            addedById: patientId,
            addedByRole: "Patient",
        })),
        lifeStyle
    });

  // Save to database
    const medicalHistory=await medicalHistoryInstance.save()
    if(!medicalHistory)return next(new ErrorClass('Failed to create medical history',500,'Failed to create medical history'));
    return res.status(200).json({ message: "Medical history created successfully", medicalHistory });
};

/**
 * @api {get} /medicalHistories/patientgetMedicalHistory
 * @returns  {object} return response {message, data}   
 * @description Patient Get His Medical History
 * */
export const getPatientMedicalHistory = async (req, res, next) => {
    const patientId = req.authUser._id;
    //get medical history
        const medicalHistory = await MedicalHistory.findOne({ patientId }).populate([
            { 
                path: "patientId",
                select: "firstName lastName email",
                match: {isMarkedAsDeleted: false}
            },
            {
                path: 'allergy.addedById',
                select: 'firstName lastName email role' 
            },
            {
                path: 'medication.addedById',
                select: 'firstName lastName email role'
            },
            {
                path: 'chronicDiseases.addedById',
                select: 'firstName lastName email role'
            }
        ]);
        if (!medicalHistory) {
            return next(
                new ErrorClass("No medical history found", 404, "NOT_FOUND")
            );
        }
    res.status(200).json({ message: "Medical history", data: medicalHistory });
};

/**
 * @api {get} /medicalHistories/doctorViewPatientHistory
 * @returns  {object} return response {message, data}   
 * @description Doctor View Patient Medical History
*/
export const doctorViewPatientHistory = async (req, res, next) => {
    const { patientId } = req.params;
    const doctorId = req.authUser._id;
    //get appointment
    const appointment = await Appointment.findOne({ doctorId, patientId, status: { $in: ["confirmed", "completed"] } })
    .sort({ createdAt: -1 });
    if (!appointment) {
        return next(new ErrorClass("No appointment found", 404, "NOT FOUND"));
    }
    //check if allowed to view history
    if(!appointment.viewConsent && !appointment.addConsent){
        return next(new ErrorClass("You are not allowed to view this patient history", 403, "FORBIDDEN"));
    }
    //get medical history
    const medicalHistory = await MedicalHistory.findOne({ patientId }).populate([
        { 
            path: "patientId",
            select: "firstName lastName email",
            match: {isMarkedAsDeleted: false}
        },
        {
            path: 'allergy.addedById',
            select: 'firstName lastName email role' 
        },
        {
            path: 'medication.addedById',
            select: 'firstName lastName email role'
        },
        {
            path: 'chronicDiseases.addedById',
            select: 'firstName lastName email role'
        }
        ]);
    if (!medicalHistory) {
        return next(
            new ErrorClass("No medical history found", 404, "NOT FOUND")
        );
    }

    if (appointment.viewConsent && !appointment.addConsent ) {
        res.status(200).json({ message: "Medical history",ALLOWEDRole:"only View", data: medicalHistory });
        }
    else if(appointment.addConsent){
        res.status(200).json({ message: "Medical history",ALLOWEDRole:"alloewd to add", data: medicalHistory });
            }
}        