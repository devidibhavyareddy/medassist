import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Department from "../models/Department.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";
import LabOrder from "../models/LabOrder.js";
import LabResult from "../models/LabResult.js";
import Invoice from "../models/Invoice.js";
import FollowUp from "../models/FollowUp.js";
import Notification from "../models/Notification.js";


// ===============================
// ADMIN DASHBOARD
// ===============================

export const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPatients = await Patient.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalDepartments = await Department.countDocuments();
        const totalServices = await Service.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        const pendingLabOrders = await LabOrder.countDocuments({
            status: {
                $in: [
                    "ordered",
                    "samplePending",
                    "sampleCollected",
                    "processing"
                ]
            }
        });

        const pendingInvoices = await Invoice.countDocuments({
            paymentStatus: "pending"
        });

        const paidInvoices = await Invoice.countDocuments({
            paymentStatus: "paid"
        });

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers,
                totalPatients,
                totalDoctors,
                totalDepartments,
                totalServices,
                totalAppointments,
                pendingLabOrders,
                pendingInvoices,
                paidInvoices
            }
        });

    } catch (error) {
        console.error("Admin Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard"
        });
    }
};


// ===============================
// DOCTOR DASHBOARD
// ===============================

export const getDoctorDashboard = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            userId: req.user.userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);


        const todayAppointments =
            await Appointment.find({
                doctorId: doctor._id,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: {
                    $ne: "cancelled"
                }
            })
            .populate("patientId", "patientId fullName phone")
            .sort({ startTime: 1 });


        const upcomingAppointments =
            await Appointment.find({
                doctorId: doctor._id,
                date: { $gt: endOfDay },
                status: {
                    $in: ["requested", "scheduled"]
                }
            })
            .populate("patientId", "patientId fullName phone")
            .sort({ date: 1, startTime: 1 })
            .limit(5);


        const totalPatients = await Appointment.distinct(
            "patientId",
            {
                doctorId: doctor._id
            }
        );


        const pendingLabOrders =
            await LabOrder.countDocuments({
                doctorId: doctor._id,
                status: {
                    $in: [
                        "ordered",
                        "samplePending",
                        "sampleCollected",
                        "processing"
                    ]
                }
            });


        const pendingFollowUps =
            await FollowUp.countDocuments({
                doctorId: doctor._id,
                status: {
                    $in: ["pending", "scheduled"]
                }
            });


        res.status(200).json({
            success: true,
            dashboard: {
                doctor: {
                    id: doctor._id,
                    doctorId: doctor.doctorId,
                    fullName: doctor.fullName,
                    specialization: doctor.specialization
                },
                todayAppointments,
                upcomingAppointments,
                totalPatients: totalPatients.length,
                pendingLabOrders,
                pendingFollowUps
            }
        });

    } catch (error) {
        console.error("Doctor Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load doctor dashboard"
        });
    }
};


// ===============================
// RECEPTIONIST DASHBOARD
// ===============================

export const getReceptionistDashboard = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);


        const todayAppointments =
            await Appointment.find({
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: {
                    $ne: "cancelled"
                }
            })
            .populate("patientId", "patientId fullName phone")
            .populate("doctorId", "doctorId fullName specialization")
            .sort({ startTime: 1 });


        const upcomingAppointments =
            await Appointment.find({
                date: { $gt: endOfDay },
                status: {
                    $in: ["requested", "scheduled"]
                }
            })
            .populate("patientId", "patientId fullName")
            .populate("doctorId", "doctorId fullName")
            .sort({ date: 1, startTime: 1 })
            .limit(10);


        const totalPatients =
            await Patient.countDocuments();


        const pendingInvoices =
            await Invoice.countDocuments({
                paymentStatus: {
                    $in: ["pending", "partiallyPaid"]
                }
            });


        const todayCompleted =
            await Appointment.countDocuments({
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "completed"
            });


        res.status(200).json({
            success: true,
            dashboard: {
                todayAppointments,
                upcomingAppointments,
                totalPatients,
                pendingInvoices,
                todayCompleted
            }
        });

    } catch (error) {
        console.error("Receptionist Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load receptionist dashboard"
        });
    }
};


// ===============================
// LAB TECHNICIAN DASHBOARD
// ===============================

export const getLabDashboard = async (req, res) => {
    try {
        const pendingOrders =
            await LabOrder.find({
                status: {
                    $in: [
                        "ordered",
                        "samplePending",
                        "sampleCollected",
                        "processing"
                    ]
                }
            })
            .populate("patientId", "patientId fullName")
            .populate("doctorId", "doctorId fullName")
            .sort({ priority: -1, orderedAt: 1 });


        const urgentOrders =
            await LabOrder.countDocuments({
                priority: "urgent",
                status: {
                    $in: [
                        "ordered",
                        "samplePending",
                        "sampleCollected",
                        "processing"
                    ]
                }
            });


        const processingOrders =
            await LabOrder.countDocuments({
                status: "processing"
            });


        const completedOrders =
            await LabOrder.countDocuments({
                status: {
                    $in: ["completed", "verified", "released"]
                }
            });


        const myResults =
            await LabResult.countDocuments({
                technicianId: req.user.userId
            });


        res.status(200).json({
            success: true,
            dashboard: {
                pendingOrders,
                urgentOrders,
                processingOrders,
                completedOrders,
                myResults
            }
        });

    } catch (error) {
        console.error("Lab Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load lab dashboard"
        });
    }
};


// ===============================
// PATIENT DASHBOARD
// ===============================

export const getPatientDashboard = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            userId: req.user.userId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }


        const upcomingAppointment =
            await Appointment.findOne({
                patientId: patient._id,
                date: { $gte: new Date() },
                status: {
                    $in: ["requested", "scheduled"]
                }
            })
            .populate(
                "doctorId",
                "doctorId fullName specialization"
            )
            .sort({ date: 1, startTime: 1 });


        const recentPrescriptions =
            await Prescription.find({
                patientId: patient._id
            })
            .populate(
                "doctorId",
                "doctorId fullName specialization"
            )
            .sort({ createdAt: -1 })
            .limit(5);


        const recentLabResults =
            await LabResult.find({
                patientId: patient._id,
                verificationStatus: "verified"
            })
            .sort({ createdAt: -1 })
            .limit(5);


        const pendingInvoices =
            await Invoice.find({
                patientId: patient._id,
                paymentStatus: {
                    $in: ["pending", "partiallyPaid"]
                }
            })
            .sort({ issuedAt: -1 });


        const followUps =
            await FollowUp.find({
                patientId: patient._id,
                status: {
                    $in: ["pending", "scheduled"]
                }
            })
            .populate(
                "doctorId",
                "doctorId fullName specialization"
            )
            .sort({ followUpDate: 1 });


        const unreadNotifications =
            await Notification.countDocuments({
                userId: req.user.userId,
                isRead: false
            });


        res.status(200).json({
            success: true,
            dashboard: {
                patient: {
                    patientId: patient.patientId,
                    fullName: patient.fullName,
                    phone: patient.phone,
                    email: patient.email
                },
                upcomingAppointment,
                recentPrescriptions,
                recentLabResults,
                pendingInvoices,
                followUps,
                unreadNotifications
            }
        });

    } catch (error) {
        console.error("Patient Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load patient dashboard"
        });
    }
};