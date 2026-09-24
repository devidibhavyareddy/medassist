import express from "express";

import authMiddleware
    from "../middleware/authMiddleware.js";

import roleMiddleware
    from "../middleware/roleMiddleware.js";

import validateObjectId
    from "../middleware/validateObjectId.js";

import upload
    from "../middleware/uploadMiddleware.js";

import {
    uploadDocument,
    getPatientDocuments,
    getDocument
} from "../controllers/documentController.js";


const router = express.Router();


// ========================================
// UPLOAD DOCUMENT
// ========================================
router.post(
    "/upload",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "labTechnician",
        "patient"
    ),
    upload.single("document"),
    uploadDocument
);


// ========================================
// GET PATIENT DOCUMENTS
// ========================================
router.get(
    "/patient/:patientId",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "labTechnician",
        "patient"
    ),
    validateObjectId("patientId"),
    getPatientDocuments
);


// ========================================
// VIEW / DOWNLOAD DOCUMENT
// ========================================
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "labTechnician",
        "patient"
    ),
    validateObjectId("id"),
    getDocument
);


export default router;