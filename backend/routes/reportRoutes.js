import express from "express";

import {
    getClinicReports
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/clinic",
    authMiddleware,
    roleMiddleware("admin"),
    getClinicReports
);

export default router;