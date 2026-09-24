import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    searchPatients,
    searchDoctors,
    filterAppointments,
    filterLabOrders,
    filterInvoices
} from "../controllers/searchController.js";

const router = express.Router();


// ========================================
// SEARCH PATIENTS
// ========================================
router.get(
    "/patients",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist"
    ),
    searchPatients
);


// ========================================
// SEARCH DOCTORS
// ========================================
router.get(
    "/doctors",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist"
    ),
    searchDoctors
);


// ========================================
// FILTER APPOINTMENTS
// ========================================
router.get(
    "/appointments",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist"
    ),
    filterAppointments
);


// ========================================
// FILTER LAB ORDERS
// ========================================
router.get(
    "/lab-orders",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "labTechnician"
    ),
    filterLabOrders
);


// ========================================
// FILTER INVOICES
// ========================================
router.get(
    "/invoices",
    authMiddleware,
    roleMiddleware(
        "admin",
        "receptionist"
    ),
    filterInvoices
);

export default router;