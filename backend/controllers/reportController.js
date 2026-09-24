import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import LabOrder from "../models/LabOrder.js";
import Invoice from "../models/Invoice.js";

export const getClinicReports = async (req, res) => {
    try {
        const [
            totalUsers,
            totalPatients,
            totalDoctors,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            pendingLabOrders,
            pendingInvoices
        ] = await Promise.all([
            User.countDocuments(),

            Patient.countDocuments(),

            Doctor.countDocuments({
                status: "active"
            }),

            Appointment.countDocuments(),

            Appointment.countDocuments({
                status: "completed"
            }),

            Appointment.countDocuments({
                status: "cancelled"
            }),

            LabOrder.countDocuments({
                status: {
                    $nin: ["completed", "verified", "released"]
                }
            }),

            Invoice.countDocuments({
                paymentStatus: "pending"
            })
        ]);

        const revenueResult = await Invoice.aggregate([
            {
                $match: {
                    paymentStatus: "paid"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$total"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        const appointmentsByStatus =
            await Appointment.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

        res.status(200).json({
            success: true,
            reports: {
                totalUsers,
                totalPatients,
                totalDoctors,
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                pendingLabOrders,
                pendingInvoices,
                totalRevenue,
                appointmentsByStatus
            }
        });

    } catch (error) {
        console.error(
            "Clinic Reports Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while generating reports"
        });
    }
};