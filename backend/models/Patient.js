import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        patientId: {
            type: String,
            required: true,
            unique: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"]
        },

        phone: {
            type: String
        },

        email: {
            type: String,
            lowercase: true
        },

        address: {
            type: String
        },

        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        },

        bloodGroup: {
            type: String,
            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-"
            ]
        },

        allergies: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;