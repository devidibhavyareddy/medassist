import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    getAllAuditLogs,
    getAuditLogById,
    getUserAuditLogs
} from "../controllers/auditController.js";

const router = express.Router();


// Get all audit logs
// Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllAuditLogs
);


// Get audit logs of a particular user
// Admin only
router.get(
    "/user/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    getUserAuditLogs
);


// Get one audit log
// Admin only
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getAuditLogById
);

export default router;