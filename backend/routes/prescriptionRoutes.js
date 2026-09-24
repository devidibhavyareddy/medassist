import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createPrescription,
    getMyPrescriptions,
    getPrescriptionById,
    getDoctorPrescriptions,
    updatePrescription,
    getPatientPrescriptions
} from "../controllers/prescriptionController.js";


const router = express.Router();


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);


// =====================================================
// CREATE PRESCRIPTION
// Doctor / Admin
// =====================================================

router.post(
    "/",
    roleMiddleware(
        "doctor",
        "admin"
    ),
    createPrescription
);


// =====================================================
// PATIENT'S OWN PRESCRIPTIONS
// =====================================================

router.get(
    "/my",
    roleMiddleware("patient"),
    getMyPrescriptions
);


// =====================================================
// DOCTOR'S PRESCRIPTIONS
// =====================================================

router.get(
    "/doctor",
    roleMiddleware("doctor"),
    getDoctorPrescriptions
);


// =====================================================
// PATIENT PRESCRIPTIONS
// Doctor / Admin / Receptionist
// =====================================================

router.get(
    "/patient/:patientId",
    roleMiddleware(
        "doctor",
        "admin",
        "receptionist"
    ),
    getPatientPrescriptions
);


// =====================================================
// GET SINGLE PRESCRIPTION
// =====================================================

router.get(
    "/:id",
    roleMiddleware(
        "patient",
        "doctor",
        "admin",
        "receptionist"
    ),
    getPrescriptionById
);


// =====================================================
// UPDATE PRESCRIPTION
// Doctor / Admin
// =====================================================

router.put(
    "/:id",
    roleMiddleware(
        "doctor",
        "admin"
    ),
    updatePrescription
);


export default router;