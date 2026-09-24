import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
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

        followUpDate: {
            type: Date,
            required: true
        },

        instructions: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "pending",
                "scheduled",
                "completed",
                "cancelled"
            ],
            default: "pending"
        },

        notes: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const FollowUp = mongoose.model("FollowUp", followUpSchema);

export default FollowUp;