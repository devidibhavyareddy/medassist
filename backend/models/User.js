import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            trim: true
        },

        role: {
            type: String,
            enum: [
                "admin",
                "doctor",
                "receptionist",
                "labTechnician",
                "patient"
            ],
            required: true,
            default: "patient"
        },

        profileImage: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;