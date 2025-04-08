import { nanoid } from "nanoid";
import { MedicalHistory } from "../../../DB/Models/index.js";
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