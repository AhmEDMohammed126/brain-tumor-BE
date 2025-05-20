import {MedicalHistory,Patient,Encounter, Appointment} from "../../../DB/Models/index.js";
import { ApiFeatures, ErrorClass , encrypt , decrypt  } from "../../Utils/index.js";

// CREATE COMPLETE ENCOUNTER
/**
 * @api {post} /encounters/createEncounter
 */
export const createEncounter = async (req, res, next) => {
    const {
        patientId,
        appointmentId,
        complaint,
        diagnosis,
        medications,
        orders,
        notes
    }= req.body;

    const doctorId = req.authUser._id;

  // 1. Validate exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
        return next(new ErrorClass("Patient not found", 404, "NOT_FOUND"));
    }

    const appointment=await Appointment.findOne({_id:appointmentId,doctorId:doctorId,patientId:patientId,status:"confirmed"});
    if(!appointment){
        return next(new ErrorClass("ther is no appointment found", 404, "NOT_FOUND"));
    }

    // Validate encounter date (same day as appointment)
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    if (
        appointmentDate.getDate() !== today.getDate() ||
        appointmentDate.getMonth() !== today.getMonth() ||
        appointmentDate.getFullYear() !== today.getFullYear()
    ) {
        return next(new ErrorClass(
            "Encounters can only be created on the appointment date", 
            400, 
            "INVALID_ENCOUNTER_DATE"
        ));
    }
    //check if encounter exist
    const isEncounterExist= await Encounter.findOne({appointmentId:appointment._id});
    if(isEncounterExist){
        return next(new ErrorClass("Encounter already exist", 404, "You can't add encounter twice"));
    }
    // 3. Prepare encrypted data (schema-specific)
    const encryptedDiagnosis = diagnosis?.map(item => ({
        diagnoseName: encrypt(item.diagnoseName || ''),
        diagnoseInfo: encrypt(item.diagnoseInfo || '')
    })) || [];

    const encryptedMedications = medications?.map(med => ({
        name: encrypt(med.name || ''),
        dosage: encrypt(med.dosage || ''),
        frequency: med.frequency, // Non-sensitive
        dateAdded: new Date()
    })) || [];

    // 4. Create encounter
    const encounter = await Encounter.create({
        patientId,
        doctorId,
        appointmentId,
        complaint: encrypt(complaint || ''),
        diagnosis: encryptedDiagnosis,
        medications: encryptedMedications,
        orders: orders?.map(order => encrypt(order)) || [],
        notes: encrypt(notes || ''),
});

    // 5. Update medical history
    const updateOperation = {
        $push: { 
            encounter: {
                encounterId: encounter._id,
                dateAdded: new Date()
            }
        }
    };

    if (appointment.addConsent) {
        updateOperation.$push.medication = encryptedMedications.map(med => ({
            ...med,
            addedById: doctorId,
            addedByRole: "Doctor"
        }));
    }

    await MedicalHistory.findOneAndUpdate(
        { patientId },
        updateOperation,
        { new: true, lean: true }
    );

    //update appointment status
    await Appointment.findOneAndUpdate(
        { _id: appointmentId },
        { status: "completed" },
        { new: true, lean: true }
    );

    res.status(201).json({
        success: true,
        message: "Encounter created successfully",
        data: encounter
    });
};

//get encounter using api features and filter
/**
 * @api {get} /encounters/getEncounter
 */

export const getEncounter = async (req, res, next) => {
    const {page=1,limit=20,sort,...filters}=req.query;
    //find docters
    const model = Encounter
    const ApiFeaturesInstance = new ApiFeatures(model,req.query,[
        { 
            path: "patientId",
            select: "firstName lastName email",
            match: {isMarkedAsDeleted: false}
        },
        {
            path: "doctorId",
            select: "firstName lastName email",
            match: {isMarkedAsDeleted: false}
        }
    ])
    .pagination()
    .filter()
    .sort();
    // 2. Execute paginated query
    const { docs: encounters, totalDocs, totalPages } = await ApiFeaturesInstance.mongooseQuery;
        
    if (!encounters || encounters.length === 0) {
        return next(new ErrorClass("No encounters found", 404, "NOT_FOUND"));
    }

    // 2. Clean and decrypt data
    const cleanEncounters = encounters.map(encounter => {
        // Base structure
        const cleanEncounter = {
            _id: encounter._id,
            patient: encounter.patientId,
            doctor: encounter.doctorId,
            appointmentId: encounter.appointmentId,
            createdAt: encounter.createdAt,
            updatedAt: encounter.updatedAt
        };

        // Decrypt and add fields conditionally
        if (encounter.complaint) cleanEncounter.complaint = decrypt(encounter.complaint);
        if (encounter.notes) cleanEncounter.notes = decrypt(encounter.notes);
        
        // Handle arrays
        if (encounter.diagnosis?.length) {
            cleanEncounter.diagnosis = encounter.diagnosis.map(d => ({
                diagnoseName: decrypt(d.diagnoseName),
                diagnoseInfo: decrypt(d.diagnoseInfo)
            }));
        }

        if (encounter.medications?.length) {
            cleanEncounter.medications = encounter.medications.map(m => ({
                name: decrypt(m.name),
                dosage: decrypt(m.dosage),
                frequency: m.frequency, 
                dateAdded: m.dateAdded
            }));
        }

        if (encounter.orders?.length) {
            cleanEncounter.orders = encounter.orders.map(o => decrypt(o));
        }

        return cleanEncounter;
    });

    // 4. Send formatted response
    res.status(200).json({
        success: true,
        data: cleanEncounters,
        pagination: {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 15,
            total: totalDocs,
            pages: totalPages
        },
    }); 
};

export const updateEncounter = async (req, res, next) => {
    const { encounterId } = req.params;
    const doctorId = req.authUser._id;
    //Check 24-hour window
    const encounter = await Encounter.findOne({_id:encounterId,doctorId:doctorId}).lean();
    if (!encounter) {
        return next(new ErrorClass("Encounter not found", 404, "NOT_FOUND"));
    }    

    const appointment=await Appointment.findOne({_id:encounter.appointmentId,doctorId:doctorId,patientId:encounter.patientId});
    if(!appointment){
        return next(new ErrorClass("ther is no appointment found", 404, "NOT_FOUND"));
    }

    const updateWindowHours = (Date.now() - encounter.createdAt) / (1000 * 60 * 60);
    if (updateWindowHours > 24) {
        return next(new ErrorClass(
            "Encounters can only be updated within 24 hours of creation",
            403,
            "UPDATE_WINDOW_EXPIRED"
        ));
    }
    // Validate allowed fields
    const allowedFields = ['complaint', 'diagnosis', 'medications', 'orders', 'notes'];
    const updates = Object.keys(req.body).filter(key => allowedFields.includes(key));
    
    if (updates.length === 0) {
        return next(new ErrorClass(
            "Only complaint, diagnosis, medications, orders, and notes can be updated",
            400,
            "INVALID UPDATE FIELDS"
        ));
    }

    //Prepare encrypted updates and change log
    const updatePayload = {};
    const oldValues = {};
    const changeLog = {
        timestamp: new Date(),
        changedFields: [],
        oldValues: {}
    };
    for (const field of updates) {
        // Store old value
        oldValues[field] = encounter[field];
        changeLog.changedFields.push(field);
        changeLog.oldValues[field] = encounter[field];

        // Encrypt new values
        switch(field) {
            case 'complaint':
            case 'notes':
                updatePayload[field] = encrypt(req.body[field] || '');
                break;
            
            case 'diagnosis':
                updatePayload[field] = (req.body[field] || []).map(item => ({
                    diagnoseName: encrypt(item.diagnoseName || ''),
                    diagnoseInfo: encrypt(item.diagnoseInfo || '')
                }));
                break;
            
            case 'medications':
                updatePayload[field] = (req.body[field] || []).map(med => ({
                    name: encrypt(med.name || ''),
                    dosage: encrypt(med.dosage || ''),
                    frequency: med.frequency,
                    dateAdded: med.dateAdded || new Date()
                }));
                break;
            
            case 'orders':
                updatePayload[field] = (req.body[field] || []).map(order => encrypt(order));
                break;
            
            default:
                updatePayload[field] = req.body[field];
        }
    }

    // 6. Update encounter
    const updatedEncounter = await Encounter.findByIdAndUpdate(
        encounterId,
        {
            $set: updatePayload,
            $push: { updateLogs: changeLog }
        },
        { new: true, lean: true }
    );
    // 7. Synchronize with medical history if medications changed
if (updates.includes('medications') && appointment.addConsent) {
    const toleranceMs = 24 * 60 * 60 * 1000;

    for (const oldMed of encounter.medications) {
        const encounterTime = new Date(oldMed.dateAdded);
        const lowerBound = new Date(encounterTime.getTime() - toleranceMs);
        const upperBound = new Date(encounterTime.getTime() + toleranceMs);

        const decryptedName = decrypt(oldMed.name || '');
        const decryptedDosage = decrypt(oldMed.dosage || '');

        await MedicalHistory.updateOne(
            { patientId: encounter.patientId },
            {
                $pull: {
                    medication: {
                        name: encrypt(decryptedName),
                        dosage: encrypt(decryptedDosage),
                        frequency: oldMed.frequency,
                        addedById: doctorId,
                        addedByRole: "Doctor",
                        dateAdded: { $lte: upperBound, $gte: lowerBound }
                    }
                }
            }
        );
    }

    // Push new medications
    if (req.body.medications?.length) {
        await MedicalHistory.findOneAndUpdate(
            { patientId: encounter.patientId },
            {
                $push: {
                    medication: req.body.medications.map(med => ({
                        addedById: doctorId,
                        addedByRole: "Doctor",
                        name: encrypt(med.name || ''),
                        dosage: encrypt(med.dosage || ''),
                        frequency: med.frequency,
                        dateAdded: new Date()
                    }))
                }
            },
            { new: true }
        );
    }
}

    res.status(200).json({success: true,data: updatedEncounter});
};