import { nanoid } from "nanoid";
import { Appointment, MedicalHistory } from "../../../DB/Models/index.js";
import { ErrorClass , uploadFile , encrypt , decrypt } from "../../Utils/index.js";

/**
 * @description Create a new medical history
 * @route POST /medicalHistories/createMedicalHistory
 * 
 */

export const createMedicalHistory = async (req, res, next) => {
    const { allergy, chronicDiseases, pastSurgeries, familyHistory, medication, lifeStyle,weight,bloodType,height } = req.body;
    const patientId = req.authUser._id;

    // Check for existing medical history
    const existingMedicalHistory = await MedicalHistory.findOne({ patientId });
    if (existingMedicalHistory) {
        return next(new ErrorClass("Medical history already exists for this patient", 400, "DUPLICATE_ENTRY"));
    }
    const uploadedDocs = [];
    if (req.files?.medicalDocuments?.length > 0 ) {

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
    weight:{
            value: weight,
            addedById: patientId,
            addedByRole: "Patient",
        },
        height: {
            value: height,
            addedById: patientId,
            addedByRole: "Patient",
        },
        bloodType: {
            value: bloodType,
            addedById: patientId,
            addedByRole: "Patient",
        },
    allergy: allergy?.map(item => ({
        allergyName: encrypt(item.allergyName), 
        addedById: patientId,
        addedByRole: "Patient",
    })),
    chronicDiseases: chronicDiseases?.map(item => ({
        chronicName: encrypt(item.chronicName), 
        addedById: patientId,
        addedByRole: "Patient",
    })),
    pastSurgeries: pastSurgeries?.map(item => ({
        name: encrypt(item.name), 
        date: item.date,
        notes: encrypt(item.notes || ''),
    })),
    familyHistory: familyHistory?.map(item => ({
        relation: item.relation,
        age: item.age,
        condition: encrypt(item.condition),
    })),
    medicalDocuments: uploadedDocs || [],
    medication: medication?.map(item => ({
        name: encrypt(item.name), 
        dosage: encrypt(item.dosage), 
        frequency: item.frequency,
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
            },
            {
                path: 'weight.addedById',
                select: 'firstName lastName email role' 
            },
            {
                path: 'height.addedById',
                select: 'firstName lastName email role' 
            },
            {
                path: 'bloodType.addedById',
                select: 'firstName lastName email role' 
            },
        ]).lean();

        if (!medicalHistory) {
            return next(
                new ErrorClass("No medical history found", 404, "NOT_FOUND")
            );
        }

        // Decrypt sensitive fields
        const decryptedHistory = {
            ...medicalHistory,
            allergy: medicalHistory.allergy?.map(item => ({
                ...item,
                allergyName: decrypt(item.allergyName) 
            })),
            chronicDiseases: medicalHistory.chronicDiseases?.map(item => ({
                ...item,
                chronicName: decrypt(item.chronicName) 
            })),
            pastSurgeries: medicalHistory.pastSurgeries?.map(item => ({
                ...item,
                name: decrypt(item.name), 
                notes: decrypt(item.notes) 
            })),
            medication: medicalHistory.medication?.map(item => ({
                ...item,
                name: decrypt(item.name), 
                dosage: decrypt(item.dosage) 
            })),
            familyHistory: medicalHistory.familyHistory?.map(item => ({
                ...item,
                condition: decrypt(item.condition)
            })),
        };

        // handel response
        const cleanResponse = {
            _id: medicalHistory._id,
            patientId: medicalHistory.patientId,
            allergy: decryptedHistory.allergy || [],
            chronicDiseases: decryptedHistory.chronicDiseases || [],
            pastSurgeries: decryptedHistory.pastSurgeries || [],
            familyHistory: decryptedHistory.familyHistory || [],
            medicalDocuments: medicalHistory.medicalDocuments || [],
            medication: decryptedHistory.medication || [],
            lifeStyle: medicalHistory.lifeStyle || {},
            encounter: medicalHistory.encounter || [],
            weight: medicalHistory.weight || null,
            height: medicalHistory.height || null,
            bloodType: medicalHistory.bloodType || null,
            createdAt: medicalHistory.createdAt,
            updatedAt: medicalHistory.updatedAt
        };

    res.status(200).json({ message: "Medical history", data: cleanResponse });
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
        },
        {
                path: 'weight.addedById',
                select: 'firstName lastName email role' 
        },
        {
                path: 'height.addedById',
                select: 'firstName lastName email role' 
        },
        {
                path: 'bloodType.addedById',
                select: 'firstName lastName email role' 
        },
        ]).lean();
    if (!medicalHistory) {
        return next(
            new ErrorClass("No medical history found", 404, "NOT FOUND")
        );
    }

    // Decrypt sensitive fields
    const decryptedHistory = {
        ...medicalHistory,
        allergy: medicalHistory.allergy?.map(item => ({
            ...item,
            allergyName: decrypt(item.allergyName) // Decrypt allergy name
        })),
        chronicDiseases: medicalHistory.chronicDiseases?.map(item => ({
            ...item,
            chronicName: decrypt(item.chronicName) // Decrypt disease name
        })),
        pastSurgeries: medicalHistory.pastSurgeries?.map(item => ({
            ...item,
            name: decrypt(item.name), 
            notes: decrypt(item.notes) // Decrypt notes
        })),
        medication: medicalHistory.medication?.map(item => ({
            ...item,
            name: decrypt(item.name), // Decrypt medication name
            dosage: decrypt(item.dosage) // Decrypt dosage
        })),
        familyHistory: medicalHistory.familyHistory?.map(item => ({
            ...item,
            condition: decrypt(item.condition) // Decrypt condition
        })),
        
    };

    // handel response
    const cleanResponse = {
        _id: medicalHistory._id,
        patientId: medicalHistory.patientId,
        allergy: decryptedHistory.allergy || [],
        chronicDiseases: decryptedHistory.chronicDiseases || [],
        pastSurgeries: decryptedHistory.pastSurgeries || [],
        familyHistory: decryptedHistory.familyHistory || [],
        medicalDocuments: medicalHistory.medicalDocuments || [],
        medication: decryptedHistory.medication || [],
        lifeStyle: medicalHistory.lifeStyle || {},
        encounter: medicalHistory.encounter || [],
        weight: medicalHistory.weight || null,
        height: medicalHistory.height || null,
        bloodType: medicalHistory.bloodType || null,
        createdAt: medicalHistory.createdAt,
        updatedAt: medicalHistory.updatedAt
    };

    if (appointment.viewConsent && !appointment.addConsent ) {
        res.status(200).json({ message: "Medical history",ALLOWEDRole:"only View", data: cleanResponse });
        }
    else if(appointment.addConsent){
        res.status(200).json({ message: "Medical history",ALLOWEDRole:"alloewd to add", data: cleanResponse });
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

    // Field Permission Management
    const doctorAllowed = ['allergy', 'chronicDiseases', 'weight', 'height', 'bloodType'];
    const patientAllowed = ['allergy', 'chronicDiseases', 'medicalDocuments', 'pastSurgeries', 'medication', 'lifeStyle', 'familyHistory', 'weight', 'height', 'bloodType'];
    const allowedFields = isDoctor ? doctorAllowed : patientAllowed;

    const unauthorizedFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (isDoctor && (unauthorizedFields.length > 0 || req.files?.medicalDocuments?.length > 0)) {
        return next(new ErrorClass(
            `Doctors can only add: ${doctorAllowed.join(', ')}. Invalid fields: ${unauthorizedFields.join(', ')}`,
            403,
            "UNAUTHORIZED_FIELDS"
        ));
    }

    const pushData = {};
    const setData = {};

    const updates = Object.keys(req.body).filter(key => allowedFields.includes(key));
    for (const field of updates) {
        const fieldValue = req.body[field];

        // Handle single-object fields (weight, height, bloodType)
        if (['weight', 'height', 'bloodType'].includes(field)) {
            setData[field] = {
                value: fieldValue.value,
                addedById: authUser._id,
                addedByRole: isDoctor ? 'Doctor' : 'Patient',
                dateAdded: new Date()
            };
        }

        // Handle array fields
        else {
            let entries = fieldValue.map(entry => {
                const baseEntry = {
                    ...entry,
                    dateAdded: new Date()
                };

                // Add role-based metadata
                if (['allergy', 'chronicDiseases', 'medication'].includes(field)) {
                    baseEntry.addedById = authUser._id;
                    baseEntry.addedByRole = isDoctor ? 'Doctor' : 'Patient';
                }

                // Encrypt sensitive fields
                switch (field) {
                    case 'allergy':
                        return { ...baseEntry, allergyName: encrypt(entry.allergyName) };
                    case 'chronicDiseases':
                        return { ...baseEntry, chronicName: encrypt(entry.chronicName) };
                    case 'medication':
                        return {
                            ...baseEntry,
                            name: encrypt(entry.name),
                            dosage: encrypt(entry.dosage)
                        };
                    case 'pastSurgeries':
                        return {
                            ...baseEntry,
                            name: encrypt(entry.name),
                            notes: encrypt(entry.notes || '')
                        };
                    case 'familyHistory':
                        return {
                            ...baseEntry,
                            condition: encrypt(entry.condition)
                        };
                    case 'lifeStyle':
                        return entry;
                    default:
                        return baseEntry;
                }
            });

            pushData[field] = { $each: entries };
        }
    }

    // Handle medicalDocuments upload
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

    // Combine updates
    const updateObject = {};
    if (Object.keys(pushData).length > 0) updateObject.$push = pushData;
    if (Object.keys(setData).length > 0) updateObject.$set = setData;

    const updatedHistory = await MedicalHistory.findByIdAndUpdate(
        medicalHistory._id,
        updateObject,
        { new: true, runValidators: true }
    ).lean();

    res.status(200).json({
        success: true,
        message: "Medical history updated",
        data: updatedHistory
    });
};
