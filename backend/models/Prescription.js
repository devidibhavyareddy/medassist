import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        medicineName: {
            type: String,
            required: true
        },

        dosage: {
            type: String,
            required: true
        },

        frequency: {
            type: String,
            required: true
        },

        duration: {
            type: String,
            required: true
        },

        route: {
            type: String
        },

        timing: {
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

const prescriptionSchema = new mongoose.Schema(
    {
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

        medicines: {
            type: [medicineSchema],
            required: true
        },

        generalInstructions: {
            type: String
        },

        followUpInstructions: {
            type: String
        },

        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Prescription = mongoose.model(
    "Prescription",
    prescriptionSchema
);

export default Prescription;