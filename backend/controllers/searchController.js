import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import LabOrder from "../models/LabOrder.js";
import Invoice from "../models/Invoice.js";


// ========================================
// SEARCH PATIENTS
// ========================================
export const searchPatients = async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {};

        if (search) {
            filter = {
                $or: [
                    {
                        fullName: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        patientId: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        phone: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        email: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
            };
        }

        const patients = await Patient.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });

    } catch (error) {
        console.error("Search Patients Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while searching patients"
        });
    }
};


// ========================================
// SEARCH DOCTORS
// ========================================
export const searchDoctors = async (req, res) => {
    try {
        const { search, specialization, status } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                {
                    fullName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    doctorId: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    specialization: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        if (specialization) {
            filter.specialization = {
                $regex: specialization,
                $options: "i"
            };
        }

        if (status) {
            filter.status = status;
        }

        const doctors = await Doctor.find(filter)
            .populate("department", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Search Doctors Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while searching doctors"
        });
    }
};


// ========================================
// FILTER APPOINTMENTS
// ========================================
export const filterAppointments = async (req, res) => {
    try {
        const {
            date,
            status,
            doctorId,
            patientId
        } = req.query;

        let filter = {};

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            filter.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        if (status) {
            filter.status = status;
        }

        if (doctorId) {
            filter.doctorId = doctorId;
        }

        if (patientId) {
            filter.patientId = patientId;
        }

        const appointments = await Appointment.find(filter)
            .populate("patientId", "patientId fullName phone")
            .populate("doctorId", "doctorId fullName specialization")
            .populate("departmentId", "name")
            .sort({ date: -1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error("Filter Appointments Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while filtering appointments"
        });
    }
};


// ========================================
// FILTER LAB ORDERS
// ========================================
export const filterLabOrders = async (req, res) => {
    try {
        const {
            status,
            priority,
            patientId,
            doctorId
        } = req.query;

        let filter = {};

        if (status) {
            filter.status = status;
        }

        if (priority) {
            filter.priority = priority;
        }

        if (patientId) {
            filter.patientId = patientId;
        }

        if (doctorId) {
            filter.doctorId = doctorId;
        }

        const labOrders = await LabOrder.find(filter)
            .populate("patientId", "patientId fullName")
            .populate("doctorId", "doctorId fullName specialization")
            .sort({ orderedAt: -1 });

        res.status(200).json({
            success: true,
            count: labOrders.length,
            labOrders
        });

    } catch (error) {
        console.error("Filter Lab Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while filtering lab orders"
        });
    }
};


// ========================================
// FILTER INVOICES
// ========================================
export const filterInvoices = async (req, res) => {
    try {
        const {
            paymentStatus,
            patientId,
            paymentMethod
        } = req.query;

        let filter = {};

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (patientId) {
            filter.patientId = patientId;
        }

        if (paymentMethod) {
            filter.paymentMethod = paymentMethod;
        }

        const invoices = await Invoice.find(filter)
            .populate("patientId", "patientId fullName phone")
            .sort({ issuedAt: -1 });

        res.status(200).json({
            success: true,
            count: invoices.length,
            invoices
        });

    } catch (error) {
        console.error("Filter Invoices Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while filtering invoices"
        });
    }
};