import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserStatus,

    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,

    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,

    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,

    getAdminDashboard
} from "../controllers/adminController.js";

const router = express.Router();


// =====================================================
// ADMIN AUTHORIZATION
// =====================================================

router.use(authMiddleware);
router.use(roleMiddleware("admin"));


// =====================================================
// USER ROUTES
// =====================================================

router.get("/users", getAllUsers);

router.get("/users/:id", getUserById);

router.put("/users/:id/role", updateUserRole);

router.put("/users/:id/status", toggleUserStatus);


// =====================================================
// DEPARTMENT ROUTES
// =====================================================

router.post("/departments", createDepartment);

router.get("/departments", getAllDepartments);

router.get("/departments/:id", getDepartmentById);

router.put("/departments/:id", updateDepartment);

router.delete("/departments/:id", deleteDepartment);

// =====================================================
// SERVICE ROUTES
// =====================================================

router.post("/services", createService);

router.get("/services", getAllServices);

router.get("/services/:id", getServiceById);

router.put("/services/:id", updateService);

router.delete("/services/:id", deleteService);


// =====================================================
// DOCTOR ROUTES
// =====================================================

router.post("/doctors", createDoctor);

router.get("/doctors", getAllDoctors);

router.get("/doctors/:id", getDoctorById);

router.put("/doctors/:id", updateDoctor);

router.delete("/doctors/:id", deleteDoctor);

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get("/dashboard", getAdminDashboard);

export default router;