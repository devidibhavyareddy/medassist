import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        doctorId: {
            type: String,
            required: true,
            unique: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        specialization: {
            type: String,
            required: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        qualification: {
            type: String
        },

        experience: {
            type: Number,
            default: 0
        },

        consultationFee: {
            type: Number,
            default: 0
        },

        availableDays: {
            type: [String],
            default: []
        },

        workingHours: {
            start: String,
            end: String
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;