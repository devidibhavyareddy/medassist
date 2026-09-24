import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    getPatientTimeline
} from "../controllers/patientTimelineController.js";

const router = express.Router();


// Get complete patient timeline
router.get(
    "/:patientId",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist"
    ),
    getPatientTimeline
);

export default router;