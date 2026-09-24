import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createMedicalRecord,
    getMedicalRecordById,
    getPatientMedicalRecords,
    updateMedicalRecord,
    getDoctorMedicalRecords
} from "../controllers/medicalRecordController.js";


const router = express.Router();


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);


// =====================================================
// CREATE MEDICAL RECORD
// Doctor / Admin
// =====================================================

router.post(
    "/",
    roleMiddleware(
        "doctor",
        "admin"
    ),
    createMedicalRecord
);


// =====================================================
// PATIENT'S OWN MEDICAL HISTORY
// =====================================================

router.get(
    "/my",
    roleMiddleware("patient"),
    getPatientMedicalRecords
);


// =====================================================
// DOCTOR'S MEDICAL RECORDS
// =====================================================

router.get(
    "/doctor",
    roleMiddleware("doctor"),
    getDoctorMedicalRecords
);


// =====================================================
// PATIENT MEDICAL HISTORY
// Doctor / Admin / Receptionist
// =====================================================

router.get(
    "/patient/:patientId",
    roleMiddleware(
        "doctor",
        "admin",
        "receptionist"
    ),
    getPatientMedicalRecords
);


// =====================================================
// GET SINGLE MEDICAL RECORD
// =====================================================

router.get(
    "/:id",
    roleMiddleware(
        "patient",
        "doctor",
        "admin",
        "receptionist"
    ),
    getMedicalRecordById
);


// =====================================================
// UPDATE MEDICAL RECORD
// Doctor / Admin
// =====================================================

router.put(
    "/:id",
    roleMiddleware(
        "doctor",
        "admin"
    ),
    updateMedicalRecord
);


export default router;