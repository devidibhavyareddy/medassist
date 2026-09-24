import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// =====================================================
// ANY LOGGED-IN USER
// =====================================================

router.get(
    "/protected",
    authMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: "You accessed a protected route",
            user: req.user
        });
    }
);


// =====================================================
// ADMIN ONLY
// =====================================================

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin. You have admin access.",
            user: req.user
        });
    }
);


// =====================================================
// DOCTOR ONLY
// =====================================================

router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Doctor. You have doctor access.",
            user: req.user
        });
    }
);


// =====================================================
// RECEPTIONIST ONLY
// =====================================================

router.get(
    "/receptionist",
    authMiddleware,
    roleMiddleware("receptionist"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Receptionist. You have receptionist access.",
            user: req.user
        });
    }
);


// =====================================================
// LAB TECHNICIAN ONLY
// =====================================================

router.get(
    "/lab-technician",
    authMiddleware,
    roleMiddleware("labTechnician"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Lab Technician. You have lab access.",
            user: req.user
        });
    }
);


// =====================================================
// PATIENT ONLY
// =====================================================

router.get(
    "/patient",
    authMiddleware,
    roleMiddleware("patient"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Patient. You have patient access.",
            user: req.user
        });
    }
);


// =====================================================
// ADMIN OR RECEPTIONIST
// =====================================================

router.get(
    "/staff",
    authMiddleware,
    roleMiddleware("admin", "receptionist"),
    (req, res) => {
        res.json({
            success: true,
            message: "You have staff access.",
            user: req.user
        });
    }
);

export default router;