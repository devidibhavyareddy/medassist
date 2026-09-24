import MedicalRecord from "../models/MedicalRecord.js";
import Doctor from "../models/Doctor.js";

import {
    generateClinicalSummary
} from "../services/aiService.js";

import { createAuditLog } from "../services/auditService.js";

// ========================================
// GENERATE AI CLINICAL SUMMARY
// ========================================
export const generateAISummary = async (req, res) => {

    try {

        const { id } = req.params;

        // Find medical record
        const medicalRecord = await MedicalRecord.findById(id);

        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });
        }


        // Find logged-in doctor
        const doctor = await Doctor.findOne({
            userId: req.user.userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }


        // Make sure doctor owns this record
        if (
            medicalRecord.doctorId.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only generate summaries for your own records"
            });
        }


        // Generate summary
        const summary = await generateClinicalSummary({

            chiefComplaint:
                medicalRecord.chiefComplaint,

            symptoms:
                medicalRecord.symptoms,

            examinationFindings:
                medicalRecord.examinationFindings,

            diagnosis:
                medicalRecord.diagnosis,

            clinicalNotes:
                medicalRecord.clinicalNotes,

            treatmentPlan:
                medicalRecord.treatmentPlan,

            followUpDate:
                medicalRecord.followUpDate
        });
await createAuditLog({
    userId: req.user.userId,
    action: "GENERATE_AI_SUMMARY",
    entityType: "MedicalRecord",
    entityId: medicalRecord._id,
    metadata: {
        patientId: medicalRecord.patientId
    }
});

        res.status(200).json({

            success: true,

            message: "AI clinical summary generated successfully",

            aiSummary: summary,

            requiresDoctorReview: true

        });

    } catch (error) {

        console.error(
            "AI Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate AI clinical summary"
        });
    }
};



// ========================================
// SAVE / APPROVE AI SUMMARY
// ========================================
export const approveAISummary = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            aiSummary
        } = req.body;


        if (!aiSummary) {
            return res.status(400).json({
                success: false,
                message: "AI summary is required"
            });
        }


        const medicalRecord =
            await MedicalRecord.findById(id);

        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });
        }


        // Find logged-in doctor
        const doctor = await Doctor.findOne({
            userId: req.user.userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }


        // Check ownership
        if (
            medicalRecord.doctorId.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only approve summaries for your own records"
            });
        }


        // Save summary
        medicalRecord.aiSummary =
            aiSummary;

        medicalRecord.aiSummaryReviewed =
            true;

        await medicalRecord.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "APPROVE_AI_SUMMARY",
    entityType: "MedicalRecord",
    entityId: medicalRecord._id,
    metadata: {
        patientId: medicalRecord.patientId
    }
});


        res.status(200).json({

            success: true,

            message:
                "AI summary approved and saved successfully",

            medicalRecord

        });

    } catch (error) {

        console.error(
            "Approve AI Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to save AI summary"
        });
    }
};