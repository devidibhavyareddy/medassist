import express from "express";

import {
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    getDoctorAppointments,
    getAppointmentById,
    cancelAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    checkDoctorAvailability,
    getDoctorQueue,
    getTodayAppointments
} from "../controllers/appointmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();


// Create appointment
router.post(
    "/",
    authMiddleware,
    roleMiddleware(
        "patient",
        "receptionist",
        "admin"
    ),
    createAppointment
);


// Patient's appointments
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("patient"),
    getMyAppointments
);


// All appointments
router.get(
    "/all",
    authMiddleware,
    roleMiddleware(
        "admin",
        "receptionist"
    ),
    getAllAppointments
);


// Doctor's appointments
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorAppointments
);


// Today's appointments
router.get(
    "/today",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    getTodayAppointments
);


// Check doctor availability
router.get(
    "/availability",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    checkDoctorAvailability
);


// Doctor queue
router.get(
    "/queue",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist"
    ),
    getDoctorQueue
);


// Get appointment by ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    validateObjectId("id"),
    getAppointmentById
);


// Cancel appointment
router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    validateObjectId("id"),
    cancelAppointment
);


// Update appointment status
router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware(
        "admin",
        "doctor",
        "receptionist"
    ),
    validateObjectId("id"),
    updateAppointmentStatus
);


// Reschedule appointment
router.put(
    "/:id/reschedule",
    authMiddleware,
    roleMiddleware(
        "admin",
        "receptionist",
        "patient"
    ),
    validateObjectId("id"),
    rescheduleAppointment
);


export default router;