import express from "express";

import authMiddleware
    from "../middleware/authMiddleware.js";

import roleMiddleware
    from "../middleware/roleMiddleware.js";

import validateObjectId
    from "../middleware/validateObjectId.js";

import {
    getPrescriptionExplanation
} from "../controllers/patientAIController.js";


const router = express.Router();


router.post(
    "/prescription/:id/explanation",
    authMiddleware,
    roleMiddleware("patient"),
    validateObjectId("id"),
    getPrescriptionExplanation
);


export default router;