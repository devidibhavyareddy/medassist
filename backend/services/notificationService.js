import Notification from "../models/Notification.js";

export const createNotification = async ({
    userId,
    title,
    message,
    type = "system"
}) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type
        });

        return notification;
    } catch (error) {
        console.error("Notification Error:", error.message);
        return null;
    }
};