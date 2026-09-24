import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            default: 1
        },

        price: {
            type: Number,
            required: true
        },

        total: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    }
);

const invoiceSchema = new mongoose.Schema(
    {
        invoiceId: {
            type: String,
            required: true,
            unique: true
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        },

        items: {
            type: [invoiceItemSchema],
            required: true
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            default: 0
        },

        tax: {
            type: Number,
            default: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "partiallyPaid",
                "paid",
                "cancelled"
            ],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "card",
                "upi",
                "online"
            ]
        },

        transactionReference: {
            type: String
        },

        issuedAt: {
            type: Date,
            default: Date.now
        },

        paidAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;