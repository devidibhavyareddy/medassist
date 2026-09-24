import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createLabOrder,
    getAllLabOrders,
    getMyLabOrders,
    getLabOrderById,
    updateLabOrderStatus,
    createLabResult,
    getLabResultByOrder,
    verifyLabResult,
    getMyLabResults
} from "../controllers/labController.js";


const router = express.Router();


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);


// =====================================================
// CREATE LAB ORDER
// Doctor / Admin
// =====================================================

router.post(
    "/orders",
    roleMiddleware(
        "doctor",
        "admin"
    ),
    createLabOrder
);


// =====================================================
// GET ALL LAB ORDERS
// Lab Technician / Admin / Receptionist
// =====================================================

router.get(
    "/orders",
    roleMiddleware(
        "labTechnician",
        "admin",
        "receptionist"
    ),
    getAllLabOrders
);


// =====================================================
// PATIENT'S LAB ORDERS
// =====================================================

router.get(
    "/orders/my",
    roleMiddleware("patient"),
    getMyLabOrders
);


// =====================================================
// GET SINGLE LAB ORDER
// =====================================================

router.get(
    "/orders/:id",
    roleMiddleware(
        "patient",
        "doctor",
        "labTechnician",
        "admin",
        "receptionist"
    ),
    getLabOrderById
);


// =====================================================
// UPDATE LAB ORDER STATUS
// Lab Technician / Admin
// =====================================================

router.put(
    "/orders/:id/status",
    roleMiddleware(
        "labTechnician",
        "admin"
    ),
    updateLabOrderStatus
);


// =====================================================
// CREATE LAB RESULT
// Lab Technician
// =====================================================

router.post(
    "/results",
    roleMiddleware(
        "labTechnician",
        "admin"
    ),
    createLabResult
);


// =====================================================
// GET LAB RESULT BY ORDER
// =====================================================

router.get(
    "/results/order/:labOrderId",
    roleMiddleware(
        "patient",
        "doctor",
        "labTechnician",
        "admin",
        "receptionist"
    ),
    getLabResultByOrder
);


// =====================================================
// VERIFY LAB RESULT
// Lab Technician / Admin
// =====================================================

router.put(
    "/results/:id/verify",
    roleMiddleware(
        "labTechnician",
        "admin"
    ),
    verifyLabResult
);


// =====================================================
// PATIENT'S LAB RESULTS
// =====================================================

router.get(
    "/results/my",
    roleMiddleware("patient"),
    getMyLabResults
);


export default router;