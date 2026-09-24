import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead
} from "../controllers/notificationController.js";

const router = express.Router();


// Get my notifications
router.get(
    "/",
    authMiddleware,
    getMyNotifications
);


// Get unread notification count
router.get(
    "/unread-count",
    authMiddleware,
    getUnreadNotificationCount
);


// Mark one notification as read
router.put(
    "/:id/read",
    authMiddleware,
    markNotificationRead
);


// Mark all notifications as read
router.put(
    "/read-all",
    authMiddleware,
    markAllNotificationsRead
);

export default router;