import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        action: {
            type: String,
            required: true
        },

        entityType: {
            type: String
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    }
);

const AuditLog = mongoose.model(
    "AuditLog",
    auditLogSchema
);

export default AuditLog;