import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
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

const Service = mongoose.model("Service", serviceSchema);

export default Service;