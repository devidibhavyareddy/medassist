import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
    userId,
    action,
    entityType,
    entityId,
    metadata
}) => {
    try {
        const auditLog = await AuditLog.create({
            userId,
            action,
            entityType,
            entityId,
            metadata
        });

        return auditLog;
    } catch (error) {
        console.error("Audit Log Error:", error.message);
        return null;
    }
};