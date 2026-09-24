import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createPatientProfile,
    getMyPatientProfile,
    updateMyPatientProfile
} from "../controllers/patientController.js";

const router = express.Router();


// =====================================================
// PATIENT ROUTES
// =====================================================

router.use(authMiddleware);


// Create profile
router.post(
    "/profile",
    roleMiddleware("patient"),
    createPatientProfile
);


// Get own profile
router.get(
    "/profile",
    roleMiddleware("patient"),
    getMyPatientProfile
);


// Update own profile
router.put(
    "/profile",
    roleMiddleware("patient"),
    updateMyPatientProfile
);


export default router;