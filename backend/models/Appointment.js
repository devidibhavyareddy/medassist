import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        appointmentId: {
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

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        reason: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "requested",
                "scheduled",
                "checkedIn",
                "inConsultation",
                "completed",
                "cancelled",
                "noShow"
            ],
            default: "requested"
        },

        queueNumber: {
            type: Number
        },

        notes: {
            type: String
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

export default Appointment;