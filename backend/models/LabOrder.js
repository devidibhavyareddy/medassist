import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            required: true
        },

        testCode: {
            type: String
        },

        instructions: {
            type: String
        }
    },
    {
        _id: false
    }
);

const labOrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        },

        tests: {
            type: [testSchema],
            required: true
        },

        priority: {
            type: String,
            enum: ["normal", "urgent"],
            default: "normal"
        },

        clinicalNote: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "ordered",
                "samplePending",
                "sampleCollected",
                "processing",
                "completed",
                "verified",
                "released"
            ],
            default: "ordered"
        },

        orderedAt: {
            type: Date,
            default: Date.now
        },

        collectedAt: {
            type: Date
        },

        processedAt: {
            type: Date
        },

        verifiedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const LabOrder = mongoose.model(
    "LabOrder",
    labOrderSchema
);

export default LabOrder;