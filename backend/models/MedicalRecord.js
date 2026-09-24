import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        },

        visitDate: {
            type: Date,
            default: Date.now
        },

        chiefComplaint: {
            type: String
        },

        symptoms: {
            type: [String],
            default: []
        },

        examinationFindings: {
            type: String
        },

        diagnosis: {
            type: String
        },

        clinicalNotes: {
            type: String
        },

        treatmentPlan: {
            type: String
        },

        followUpDate: {
            type: Date
        },

        aiSummary: {
            type: String,
            default: ""
        },

        aiSummaryReviewed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const MedicalRecord = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);

export default MedicalRecord;