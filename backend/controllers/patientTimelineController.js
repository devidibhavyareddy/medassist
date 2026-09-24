import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Prescription from "../models/Prescription.js";
import LabOrder from "../models/LabOrder.js";
import LabResult from "../models/LabResult.js";
import Invoice from "../models/Invoice.js";
import FollowUp from "../models/FollowUp.js";


// GET PATIENT TIMELINE
export const getPatientTimeline = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Check patient
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Get all patient data
        const appointments = await Appointment.find({
            patientId
        })
            .populate("doctorId", "fullName specialization")
            .populate("departmentId", "name")
            .sort({ date: -1 });

        const medicalRecords = await MedicalRecord.find({
            patientId
        })
            .populate("doctorId", "fullName specialization")
            .sort({ visitDate: -1 });

        const prescriptions = await Prescription.find({
            patientId
        })
            .populate("doctorId", "fullName specialization")
            .sort({ createdAt: -1 });

        const labOrders = await LabOrder.find({
            patientId
        })
            .populate("doctorId", "fullName specialization")
            .sort({ orderedAt: -1 });

        const labResults = await LabResult.find({
            patientId,
            verificationStatus: "verified"
        })
            .populate("technicianId", "name")
            .sort({ createdAt: -1 });

        const invoices = await Invoice.find({
            patientId
        })
            .sort({ issuedAt: -1 });

        const followUps = await FollowUp.find({
            patientId
        })
            .populate("doctorId", "fullName specialization")
            .sort({ followUpDate: -1 });


        // Create timeline
        const timeline = [];

        // Appointments
        appointments.forEach((appointment) => {
            timeline.push({
                type: "appointment",
                date: appointment.date,
                data: appointment
            });
        });


        // Medical records
        medicalRecords.forEach((record) => {
            timeline.push({
                type: "medicalRecord",
                date: record.visitDate,
                data: record
            });
        });


        // Prescriptions
        prescriptions.forEach((prescription) => {
            timeline.push({
                type: "prescription",
                date: prescription.createdAt,
                data: prescription
            });
        });


        // Lab orders
        labOrders.forEach((order) => {
            timeline.push({
                type: "labOrder",
                date: order.orderedAt,
                data: order
            });
        });


        // Lab results
        labResults.forEach((result) => {
            timeline.push({
                type: "labResult",
                date: result.createdAt,
                data: result
            });
        });


        // Invoices
        invoices.forEach((invoice) => {
            timeline.push({
                type: "invoice",
                date: invoice.issuedAt,
                data: invoice
            });
        });


        // Follow-ups
        followUps.forEach((followUp) => {
            timeline.push({
                type: "followUp",
                date: followUp.followUpDate,
                data: followUp
            });
        });


        // Sort everything by date
        timeline.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );


        res.status(200).json({
            success: true,

            patient: {
                id: patient._id,
                patientId: patient.patientId,
                fullName: patient.fullName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone,
                email: patient.email,
                bloodGroup: patient.bloodGroup,
                allergies: patient.allergies
            },

            timeline
        });

    } catch (error) {
        console.error("Patient Timeline Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching patient timeline"
        });
    }
};