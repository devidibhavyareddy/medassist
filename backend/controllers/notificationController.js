import Notification from "../models/Notification.js";


// GET MY NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.userId
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error("Get Notifications Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching notifications"
        });
    }
};


// GET UNREAD NOTIFICATION COUNT
export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });

    } catch (error) {
        console.error("Unread Count Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching unread count"
        });
    }
};


// MARK ONE NOTIFICATION AS READ
export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            userId: req.user.userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error("Mark Notification Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating notification"
        });
    }
};


// MARK ALL NOTIFICATIONS AS READ
export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.user.userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Mark All Notifications Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating notifications"
        });
    }
};