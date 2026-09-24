import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    createInvoice,
    getAllInvoices,
    getMyInvoices,
    getInvoiceById,
    recordPayment,
    updateInvoice,
    cancelInvoice
} from "../controllers/invoiceController.js";


const router = express.Router();


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);


// =====================================================
// CREATE INVOICE
// Admin / Receptionist
// =====================================================

router.post(
    "/",
    roleMiddleware(
        "admin",
        "receptionist"
    ),
    createInvoice
);


// =====================================================
// GET ALL INVOICES
// Admin / Receptionist
// =====================================================

router.get(
    "/",
    roleMiddleware(
        "admin",
        "receptionist"
    ),
    getAllInvoices
);


// =====================================================
// PATIENT'S OWN INVOICES
// =====================================================

router.get(
    "/my",
    roleMiddleware("patient"),
    getMyInvoices
);


// =====================================================
// GET SINGLE INVOICE
// =====================================================

router.get(
    "/:id",
    roleMiddleware(
        "patient",
        "admin",
        "receptionist"
    ),
    getInvoiceById
);


// =====================================================
// RECORD PAYMENT
// Admin / Receptionist
// =====================================================

router.put(
    "/:id/payment",
    roleMiddleware(
        "admin",
        "receptionist"
    ),
    recordPayment
);


// =====================================================
// UPDATE INVOICE
// Admin / Receptionist
// =====================================================

router.put(
    "/:id",
    roleMiddleware(
        "admin",
        "receptionist"
    ),
    updateInvoice
);


// =====================================================
// CANCEL INVOICE
// Admin
// =====================================================

router.put(
    "/:id/cancel",
    roleMiddleware("admin"),
    cancelInvoice
);


export default router;