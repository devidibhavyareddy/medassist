import Invoice from "../models/Invoice.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import { createNotification } from "../services/notificationService.js";
import { createAuditLog } from "../services/auditService.js";


// =====================================================
// CREATE INVOICE
// Admin / Receptionist
// =====================================================

export const createInvoice = async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            items,
            discount,
            tax
        } = req.body;

        if (!patientId || !items) {
            return res.status(400).json({
                success: false,
                message: "Patient ID and invoice items are required"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one invoice item is required"
            });
        }


        // Check patient
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        // Check appointment if provided
        if (appointmentId) {
            const appointment =
                await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found"
                });
            }

            if (
                appointment.patientId.toString() !==
                patientId.toString()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Appointment does not belong to this patient"
                });
            }
        }


        // Calculate item totals
        const processedItems = items.map((item) => {

            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;

            return {
                description: item.description,
                quantity,
                price,
                total: quantity * price
            };
        });


        // Make sure descriptions exist
        for (const item of processedItems) {
            if (!item.description) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Every invoice item must have a description"
                });
            }
        }


        const subtotal = processedItems.reduce(
            (sum, item) => sum + item.total,
            0
        );


        const discountAmount = Number(discount) || 0;
        const taxAmount = Number(tax) || 0;

        const total =
            subtotal -
            discountAmount +
            taxAmount;


        if (total < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Invoice total cannot be negative"
            });
        }


        // Generate invoice ID
        const invoiceCount =
            await Invoice.countDocuments();

        const invoiceId =
            `INV${String(
                invoiceCount + 1
            ).padStart(4, "0")}`;


        const invoice = await Invoice.create({
            invoiceId,
            patientId,
            appointmentId,
            items: processedItems,
            subtotal,
            discount: discountAmount,
            tax: taxAmount,
            total,
            paymentStatus: "pending"
        });

        await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_INVOICE",
    entityType: "Invoice",
    entityId: invoice._id,
    metadata: {
        invoiceId: invoice.invoiceId,
        patientId: invoice.patientId,
        total: invoice.total
    }
});

        // Notify patient
if (patient) {
    await createNotification({
        userId: patient.userId,
        title: "New Invoice",
        message: `A new invoice ${invoice.invoiceId} has been generated.`,
        type: "invoice"
    });
}


        res.status(201).json({
            success: true,
            message:
                "Invoice created successfully",
            invoice
        });

    } catch (error) {

        console.error(
            "Create Invoice Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating invoice"
        });
    }
};



// =====================================================
// GET ALL INVOICES
// Admin / Receptionist
// =====================================================

export const getAllInvoices = async (req, res) => {
    try {

        const invoices =
            await Invoice.find()
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "appointmentId",
                    "appointmentId date startTime endTime"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            success: true,
            count: invoices.length,
            invoices
        });

    } catch (error) {

        console.error(
            "Get All Invoices Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching invoices"
        });
    }
};



// =====================================================
// GET PATIENT INVOICES
// =====================================================

export const getMyInvoices = async (req, res) => {
    try {

        const patient =
            await Patient.findOne({
                userId: req.user.userId
            });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message:
                    "Patient profile not found"
            });
        }


        const invoices =
            await Invoice.find({
                patientId: patient._id
            })
                .populate(
                    "appointmentId",
                    "appointmentId date startTime endTime"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            success: true,
            count: invoices.length,
            invoices
        });

    } catch (error) {

        console.error(
            "Get My Invoices Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching invoices"
        });
    }
};



// =====================================================
// GET INVOICE BY ID
// =====================================================

export const getInvoiceById = async (req, res) => {
    try {

        const invoice =
            await Invoice.findById(
                req.params.id
            )
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "appointmentId",
                    "appointmentId date startTime endTime"
                );


        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }


        // Patient can only access own invoice
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });

            if (
                !patient ||
                invoice.patientId._id.toString() !==
                patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        res.status(200).json({
            success: true,
            invoice
        });

    } catch (error) {

        console.error(
            "Get Invoice Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching invoice"
        });
    }
};



// =====================================================
// RECORD PAYMENT
// Admin / Receptionist
// =====================================================

export const recordPayment = async (req, res) => {
    try {

        const {
            paymentMethod,
            transactionReference,
            amount
        } = req.body;


        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required"
            });
        }


        const allowedMethods = [
            "cash",
            "card",
            "upi",
            "online"
        ];


        if (!allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment method"
            });
        }


        const invoice =
            await Invoice.findById(
                req.params.id
            );


        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }


        if (
            invoice.paymentStatus === "paid"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invoice is already fully paid"
            });
        }


        const paymentAmount =
            Number(amount) || invoice.total;


        if (paymentAmount <= 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment amount must be greater than zero"
            });
        }


        if (paymentAmount > invoice.total) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment cannot be greater than invoice total"
            });
        }


        invoice.paymentMethod =
            paymentMethod;

        invoice.transactionReference =
            transactionReference || "";


        // Full payment
        if (paymentAmount === invoice.total) {

            invoice.paymentStatus = "paid";
            invoice.paidAt = new Date();

        } else {

            // Partial payment
            invoice.paymentStatus =
                "partiallyPaid";
        }


        await invoice.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "RECORD_PAYMENT",
    entityType: "Invoice",
    entityId: invoice._id,
    metadata: {
        invoiceId: invoice.invoiceId,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod
    }
});


        res.status(200).json({
            success: true,
            message:
                "Payment recorded successfully",
            invoice
        });

    } catch (error) {

        console.error(
            "Record Payment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while recording payment"
        });
    }
};



// =====================================================
// UPDATE INVOICE
// Admin / Receptionist
// =====================================================

export const updateInvoice = async (req, res) => {
    try {

        const invoice =
            await Invoice.findById(
                req.params.id
            );


        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }


        // Do not modify already paid invoices
        if (
            invoice.paymentStatus === "paid"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Paid invoices cannot be modified"
            });
        }


        const {
            discount,
            tax
        } = req.body;


        if (discount !== undefined) {
            invoice.discount =
                Number(discount) || 0;
        }


        if (tax !== undefined) {
            invoice.tax =
                Number(tax) || 0;
        }


        // Recalculate total
        invoice.total =
            invoice.subtotal -
            invoice.discount +
            invoice.tax;


        if (invoice.total < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Invoice total cannot be negative"
            });
        }


        await invoice.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_INVOICE",
    entityType: "Invoice",
    entityId: invoice._id,
    metadata: {
        invoiceId: invoice.invoiceId,
        total: invoice.total
    }
});


        res.status(200).json({
            success: true,
            message:
                "Invoice updated successfully",
            invoice
        });

    } catch (error) {

        console.error(
            "Update Invoice Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating invoice"
        });
    }
};



// =====================================================
// CANCEL INVOICE
// Admin
// =====================================================

export const cancelInvoice = async (req, res) => {
    try {

        const invoice =
            await Invoice.findById(
                req.params.id
            );


        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }


        if (
            invoice.paymentStatus === "paid"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Paid invoice cannot be cancelled"
            });
        }


        invoice.paymentStatus =
            "cancelled";


        await invoice.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "CANCEL_INVOICE",
    entityType: "Invoice",
    entityId: invoice._id,
    metadata: {
        invoiceId: invoice.invoiceId
    }
});


        res.status(200).json({
            success: true,
            message:
                "Invoice cancelled successfully",
            invoice
        });

    } catch (error) {

        console.error(
            "Cancel Invoice Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while cancelling invoice"
        });
    }
};