import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    getAdminDashboard,
    getDoctorDashboard,
    getReceptionistDashboard,
    getLabDashboard,
    getPatientDashboard
} from "../controllers/dashboardController.js";

const router = express.Router();


// Admin Dashboard
router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
);


// Doctor Dashboard
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorDashboard
);


// Receptionist Dashboard
router.get(
    "/receptionist",
    authMiddleware,
    roleMiddleware("receptionist"),
    getReceptionistDashboard
);


// Lab Technician Dashboard
router.get(
    "/lab",
    authMiddleware,
    roleMiddleware("labTechnician"),
    getLabDashboard
);


// Patient Dashboard
router.get(
    "/patient",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientDashboard
);

export default router;