import LabOrder from "../models/LabOrder.js";
import LabResult from "../models/LabResult.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { createNotification } from "../services/notificationService.js";
import { createAuditLog } from "../services/auditService.js";


// =====================================================
// CREATE LAB ORDER
// Doctor / Admin
// =====================================================

export const createLabOrder = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentId,
            tests,
            priority,
            clinicalNote
        } = req.body;

        if (!patientId || !doctorId || !tests) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient ID, Doctor ID and tests are required"
            });
        }

        if (!Array.isArray(tests) || tests.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one lab test is required"
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


        // Check doctor
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }


        // Doctor can create orders only for themselves
        if (req.user.role === "doctor") {

            const loggedInDoctor =
                await Doctor.findOne({
                    userId: req.user.userId
                });

            if (
                !loggedInDoctor ||
                loggedInDoctor._id.toString() !==
                    doctorId.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only create lab orders for your patients"
                });
            }
        }


        // Check appointment
        if (appointmentId) {

            const appointment =
                await Appointment.findById(
                    appointmentId
                );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found"
                });
            }

            if (
                appointment.patientId.toString() !==
                    patientId.toString() ||
                appointment.doctorId.toString() !==
                    doctorId.toString()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Appointment does not match patient and doctor"
                });
            }
        }


        // Validate tests
        for (const test of tests) {

            if (!test.testName) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Every test must have a test name"
                });
            }
        }


        // Generate order ID
        const orderCount =
            await LabOrder.countDocuments();

        const orderId =
            `LAB${String(
                orderCount + 1
            ).padStart(4, "0")}`;


        const labOrder =
            await LabOrder.create({
                orderId,
                patientId,
                doctorId,
                appointmentId,
                tests,
                priority,
                clinicalNote,
                status: "ordered"
            });

            await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_LAB_ORDER",
    entityType: "LabOrder",
    entityId: labOrder._id,
    metadata: {
        orderId: labOrder.orderId,
        patientId: labOrder.patientId,
        doctorId: labOrder.doctorId
    }
});


        res.status(201).json({
            success: true,
            message:
                "Lab order created successfully",
            labOrder
        });

    } catch (error) {

        console.error(
            "Create Lab Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating lab order"
        });
    }
};



// =====================================================
// GET ALL LAB ORDERS
// Lab Technician / Admin / Receptionist
// =====================================================

export const getAllLabOrders = async (req, res) => {
    try {

        const labOrders =
            await LabOrder.find()
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "doctorId",
                    "doctorId fullName specialization"
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
            count: labOrders.length,
            labOrders
        });

    } catch (error) {

        console.error(
            "Get All Lab Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching lab orders"
        });
    }
};



// =====================================================
// GET PATIENT LAB ORDERS
// =====================================================

export const getMyLabOrders = async (req, res) => {
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


        const labOrders =
            await LabOrder.find({
                patientId: patient._id
            })
                .populate(
                    "doctorId",
                    "doctorId fullName specialization"
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
            count: labOrders.length,
            labOrders
        });

    } catch (error) {

        console.error(
            "Get My Lab Orders Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching lab orders"
        });
    }
};



// =====================================================
// GET LAB ORDER BY ID
// =====================================================

export const getLabOrderById = async (req, res) => {
    try {

        const labOrder =
            await LabOrder.findById(
                req.params.id
            )
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "doctorId",
                    "doctorId fullName specialization"
                )
                .populate(
                    "appointmentId",
                    "appointmentId date startTime endTime"
                );


        if (!labOrder) {
            return res.status(404).json({
                success: false,
                message: "Lab order not found"
            });
        }


        // Patient can only see their own order
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });

            if (
                !patient ||
                labOrder.patientId._id.toString() !==
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
            labOrder
        });

    } catch (error) {

        console.error(
            "Get Lab Order Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching lab order"
        });
    }
};



// =====================================================
// UPDATE LAB ORDER STATUS
// Lab Technician / Admin
// =====================================================

export const updateLabOrderStatus = async (
    req,
    res
) => {
    try {

        const { status } = req.body;

        const allowedStatuses = [
            "ordered",
            "samplePending",
            "sampleCollected",
            "processing",
            "completed",
            "verified",
            "released"
        ];


        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lab order status"
            });
        }


        const labOrder =
            await LabOrder.findById(
                req.params.id
            );


        if (!labOrder) {
            return res.status(404).json({
                success: false,
                message:
                    "Lab order not found"
            });
        }


        labOrder.status = status;


        // Update timestamps according to status

        if (status === "sampleCollected") {
            labOrder.collectedAt = new Date();
        }

        if (status === "processing") {
            labOrder.processedAt = new Date();
        }

        if (status === "verified") {
            labOrder.verifiedAt = new Date();
        }


        await labOrder.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_LAB_ORDER_STATUS",
    entityType: "LabOrder",
    entityId: labOrder._id,
    metadata: {
        orderId: labOrder.orderId,
        newStatus: status
    }
});


        res.status(200).json({
            success: true,
            message:
                "Lab order status updated successfully",
            labOrder
        });

    } catch (error) {

        console.error(
            "Update Lab Order Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating lab order"
        });
    }
};



// =====================================================
// CREATE LAB RESULT
// Lab Technician
// =====================================================

export const createLabResult = async (req, res) => {
    try {

        const {
            labOrderId,
            results,
            attachments,
            technicianNotes
        } = req.body;


        if (!labOrderId || !results) {
            return res.status(400).json({
                success: false,
                message:
                    "Lab order ID and results are required"
            });
        }


        if (
            !Array.isArray(results) ||
            results.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one result is required"
            });
        }


        // Find lab order
        const labOrder =
            await LabOrder.findById(
                labOrderId
            );


        if (!labOrder) {
            return res.status(404).json({
                success: false,
                message:
                    "Lab order not found"
            });
        }


        // Prevent duplicate result
        const existingResult =
            await LabResult.findOne({
                labOrderId
            });


        if (existingResult) {
            return res.status(400).json({
                success: false,
                message:
                    "Lab result already exists for this order"
            });
        }


        // Validate results
        for (const result of results) {

            if (
                !result.testName ||
                !result.value
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each result must have test name and value"
                });
            }
        }


        const labResult =
            await LabResult.create({
                labOrderId,
                patientId: labOrder.patientId,
                technicianId: req.user.userId,
                results,
                attachments,
                technicianNotes
            });

            await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_LAB_RESULT",
    entityType: "LabResult",
    entityId: labResult._id,
    metadata: {
        labOrderId: labResult.labOrderId,
        patientId: labResult.patientId
    }
});


        // Mark lab order as completed
        labOrder.status = "completed";
        labOrder.processedAt = new Date();

        await labOrder.save();


        res.status(201).json({
            success: true,
            message:
                "Lab result created successfully",
            labResult
        });

    } catch (error) {

        console.error(
            "Create Lab Result Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating lab result"
        });
    }
};



// =====================================================
// GET LAB RESULT BY ORDER
// =====================================================

export const getLabResultByOrder = async (
    req,
    res
) => {
    try {

        const labResult =
            await LabResult.findOne({
                labOrderId: req.params.labOrderId
            })
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "technicianId",
                    "name email role"
                )
                .populate(
                    "verifiedBy",
                    "name email role"
                );


        if (!labResult) {
            return res.status(404).json({
                success: false,
                message:
                    "Lab result not found"
            });
        }


        // Patient authorization
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });


            if (
                !patient ||
                labResult.patientId._id.toString() !==
                    patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }


            // Patient should only see
            // verified/released results
            if (
                labResult.verificationStatus !==
                "verified"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Lab result has not been released yet"
                });
            }
        }


        res.status(200).json({
            success: true,
            labResult
        });

    } catch (error) {

        console.error(
            "Get Lab Result Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching lab result"
        });
    }
};



// =====================================================
// VERIFY LAB RESULT
// Lab Technician / Admin
// =====================================================

export const verifyLabResult = async (
    req,
    res
) => {
    try {

        const labResult =
            await LabResult.findById(
                req.params.id
            );


        if (!labResult) {
            return res.status(404).json({
                success: false,
                message:
                    "Lab result not found"
            });
        }


        if (
            labResult.verificationStatus ===
            "verified"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Lab result is already verified"
            });
        }


        labResult.verificationStatus =
            "verified";

        labResult.verifiedBy =
            req.user.userId;

        labResult.verifiedAt =
            new Date();

        labResult.releasedAt =
            new Date();


        await labResult.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "VERIFY_LAB_RESULT",
    entityType: "LabResult",
    entityId: labResult._id,
    metadata: {
        labOrderId: labResult.labOrderId,
        patientId: labResult.patientId
    }
});


        // Update lab order
        await LabOrder.findByIdAndUpdate(
            labResult.labOrderId,
            {
                status: "released"
            }
        );


        // Notify patient
        const patient =
            await Patient.findById(
                labResult.patientId
            );

        if (patient) {
            await createNotification({
                userId: patient.userId,
                title: "Lab Result Available",
                message:
                    "Your lab result has been verified and is now available.",
                type: "lab"
            });
        }


        res.status(200).json({
            success: true,
            message:
                "Lab result verified and released successfully",
            labResult
        });

    } catch (error) {

        console.error(
            "Verify Lab Result Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while verifying lab result"
        });
    }
};

// =====================================================
// GET PATIENT LAB RESULTS
// =====================================================

export const getMyLabResults = async (
    req,
    res
) => {
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


        const results =
            await LabResult.find({
                patientId: patient._id,
                verificationStatus: "verified"
            })
                .populate(
                    "labOrderId",
                    "orderId tests priority status"
                )
                .populate(
                    "technicianId",
                    "name"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {

        console.error(
            "Get My Lab Results Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching lab results"
        });
    }
};