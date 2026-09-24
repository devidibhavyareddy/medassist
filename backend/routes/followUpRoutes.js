import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

import {
    createFollowUp,
    getMyFollowUps,
    getDoctorFollowUps,
    getPatientFollowUps,
    getFollowUpById,
    updateFollowUp
} from "../controllers/followUpController.js";

const router = express.Router();


// Create follow-up
router.post(
    "/",
    authMiddleware,
    roleMiddleware("doctor", "admin", "receptionist"),
    createFollowUp
);


// Patient's own follow-ups
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("patient"),
    getMyFollowUps
);


// Doctor's follow-ups
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorFollowUps
);


// Follow-ups of a particular patient
router.get(
    "/patient/:patientId",
    authMiddleware,
    validateObjectId("patientId"),
    roleMiddleware(
        "admin",
        "receptionist",
        "doctor"
    ),
    getPatientFollowUps
);


// Get one follow-up
router.get(
    "/:id",
    authMiddleware,
    validateObjectId("id"),
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    getFollowUpById
);

// Update follow-up
router.put(
    "/:id",
    authMiddleware,
    validateObjectId("id"),
    roleMiddleware(
        "admin",
        "doctor"
    ),
    updateFollowUp
);

export default router;