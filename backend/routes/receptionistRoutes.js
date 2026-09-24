import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createPatientByStaff
} from "../controllers/receptionistController.js";

const router = express.Router();


// =====================================================
// STAFF AUTHORIZATION
// =====================================================

router.use(authMiddleware);

router.use(
    roleMiddleware("admin", "receptionist")
);


// CREATE PATIENT
router.post(
    "/patients",
    createPatientByStaff
);


export default router;