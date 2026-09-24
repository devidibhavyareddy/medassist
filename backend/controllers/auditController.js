import AuditLog from "../models/AuditLog.js";


// GET ALL AUDIT LOGS
export const getAllAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("userId", "name email role")
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        console.error("Get Audit Logs Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching audit logs"
        });
    }
};


// GET AUDIT LOG BY ID
export const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;

        const log = await AuditLog.findById(id)
            .populate("userId", "name email role");

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Audit log not found"
            });
        }

        res.status(200).json({
            success: true,
            log
        });

    } catch (error) {
        console.error("Get Audit Log Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching audit log"
        });
    }
};


// GET AUDIT LOGS OF A USER
export const getUserAuditLogs = async (req, res) => {
    try {
        const { userId } = req.params;

        const logs = await AuditLog.find({
            userId
        })
            .populate("userId", "name email role")
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        console.error("Get User Audit Logs Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching user audit logs"
        });
    }
};