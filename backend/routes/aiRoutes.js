import express from "express";

import authMiddleware
    from "../middleware/authMiddleware.js";

import roleMiddleware
    from "../middleware/roleMiddleware.js";

import validateObjectId
    from "../middleware/validateObjectId.js";

import {
    generateAISummary,
    approveAISummary
} from "../controllers/aiController.js";


const router = express.Router();


// Generate AI summary
router.post(
    "/clinical-summary/:id",
    authMiddleware,
    roleMiddleware("doctor"),
    validateObjectId("id"),
    generateAISummary
);


// Approve and save AI summary
router.put(
    "/clinical-summary/:id/approve",
    authMiddleware,
    roleMiddleware("doctor"),
    validateObjectId("id"),
    approveAISummary
);


export default router;