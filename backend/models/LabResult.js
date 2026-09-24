import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            required: true
        },

        value: {
            type: String,
            required: true
        },

        unit: {
            type: String
        },

        referenceRange: {
            type: String
        },

        observation: {
            type: String
        }
    },
    {
        _id: false
    }
);

const labResultSchema = new mongoose.Schema(
    {
        labOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabOrder",
            required: true
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        technicianId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        results: {
            type: [resultSchema],
            required: true
        },

        attachments: {
            type: [String],
            default: []
        },

        technicianNotes: {
            type: String
        },

        verificationStatus: {
            type: String,
            enum: ["pending", "verified"],
            default: "pending"
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        verifiedAt: {
            type: Date
        },

        releasedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const LabResult = mongoose.model(
    "LabResult",
    labResultSchema
);

export default LabResult;