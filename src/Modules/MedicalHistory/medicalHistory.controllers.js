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
    const uploadedDocs = [];
    if (req.files?.medicalDocuments>0 ) {

        for (const pdfFile of req.files?.medicalDocuments) {
            const customId = nanoid(4);
            const { secure_url, public_id } = await uploadFile({
                file: pdfFile.path,
                folder: `${process.env.UPLOADS_FOLDER}/MedicalHistory/medicalDocuments/${customId}`,
                resource_type: 'raw',
            });
        uploadedDocs.push({
            customId,
            secure_url,
            public_id,
        });
    }
}
    
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
        medicalDocuments: uploadedDocs || [],
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

/**
 * @api {post} /medicalHistories/addToMedicalHistory
 * @returns  {object} return response {message, data}
 * @description Add to Medical History
 */

export const addToMedicalHistory = async (req, res, next) => {
    const { patientId } = req.params;
    const authUser = req.authUser;
    
    const isDoctor = authUser.userType === 'Doctor';

    const medicalHistory = await MedicalHistory.findOne({ patientId });
    if (!medicalHistory) {
        return next(new ErrorClass("Medical history not found", 404, "NOT_FOUND"));
    }

    if (!isDoctor && authUser._id.toString() !== patientId) {
        return next(new ErrorClass("Unauthorized access", 403, "FORBIDDEN"));
    }

    const doctorAllowed = ['allergy', 'chronicDiseases'];
    const patientAllowed = ['allergy', 'chronicDiseases', 'medicalDocuments', 'pastSurgeries', 'medication', 'lifeStyle', 'familyHistory'];
    const allowedFields = isDoctor ? doctorAllowed : patientAllowed;
    const updates = Object.keys(req.body).filter(key => allowedFields.includes(key));
    // Check for unauthorized fields for doctor
    if(isDoctor){
    const unauthorizedFields = Object.keys(req.body).filter(key => !doctorAllowed.includes(key));

    if (unauthorizedFields.length > 0 || req.files?.medicalDocuments?.length > 0) {
        return next(new ErrorClass(
            `Doctors can only add: ${doctorAllowed.join(', ')}. Invalid fields: ${unauthorizedFields.join(', ')}`,
            403,
            "UNAUTHORIZED_FIELDS"
        ));
    }
}
    const pushData = {};

    for (const field of updates) {
        const fieldValue = req.body[field];

        let entries;

        if (['allergy', 'chronicDiseases', 'medication'].includes(field)) {
            entries = fieldValue.map(entry => ({
                ...entry,
                addedById: authUser._id,
                addedByRole: isDoctor ? 'Doctor' : 'Patient',
                dateAdded: new Date()
            }));
        } else if (['pastSurgeries', 'familyHistory'].includes(field)) {
            entries = fieldValue.map(entry => ({
                ...entry,
                dateAdded: new Date()
            }));
        } else if (field === 'lifeStyle') {
            entries = fieldValue; // array of strings
        } else {
            return next(new ErrorClass(`Field ${field} is not allowed`, 400, "INVALID_FIELD"));
        }

        pushData[field] = { $each: entries };
    }

    // Handle medicalDocuments upload separately
    if (allowedFields.includes('medicalDocuments') && req.files?.medicalDocuments?.length > 0) {
        const uploadedDocs = [];

        for (const file of req.files.medicalDocuments) {
            const customId = nanoid(4);

            const { secure_url, public_id } = await uploadFile({
                file: file.path,
                folder: `${process.env.UPLOADS_FOLDER}/MedicalHistory/medicalDocuments/${customId}`,
                resource_type: 'raw',
            });

            uploadedDocs.push({
                customId,
                secure_url,
                public_id,
                dateAdded: new Date()
            });
        }

        pushData.medicalDocuments = { $each: uploadedDocs };
    }

    const updatedHistory = await MedicalHistory.findByIdAndUpdate(
        medicalHistory._id,
        { $push: pushData },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Medical history updated",
        data: updatedHistory
    });
};
