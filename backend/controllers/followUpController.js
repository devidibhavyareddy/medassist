import FollowUp from "../models/FollowUp.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { createNotification } from "../services/notificationService.js";
import { createAuditLog } from "../services/auditService.js";

// CREATE FOLLOW-UP
export const createFollowUp = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentId,
            followUpDate,
            instructions
        } = req.body;

        if (!patientId || !doctorId || !followUpDate) {
            return res.status(400).json({
                success: false,
                message: "Patient, doctor and follow-up date are required"
            });
        }

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Doctor can create follow-up only for themselves
        if (req.user.role === "doctor") {
            if (doctor.userId.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "You can only create follow-ups for yourself"
                });
            }
        }

        // Check appointment if provided
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found"
                });
            }

            if (
                appointment.patientId.toString() !== patientId ||
                appointment.doctorId.toString() !== doctorId
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Appointment does not match patient and doctor"
                });
            }
        }

        const followUp = await FollowUp.create({
            patientId,
            doctorId,
            appointmentId,
            followUpDate,
            instructions
        });

        // Notify patient
        await createNotification({
            userId: patient.userId,
            title: "Follow-up Scheduled",
            message: `Your follow-up has been scheduled for ${new Date(
                followUpDate
            ).toLocaleDateString()}.`,
            type: "followUp"
        });

        await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_FOLLOW_UP",
    entityType: "FollowUp",
    entityId: followUp._id,
    metadata: {
        patientId: followUp.patientId,
        doctorId: followUp.doctorId,
        followUpDate: followUp.followUpDate
    }
});

        res.status(201).json({
            success: true,
            message: "Follow-up created successfully",
            followUp
        });

    } catch (error) {
        console.error("Create Follow-up Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating follow-up"
        });
    }
};


// GET MY FOLLOW-UPS - PATIENT
export const getMyFollowUps = async (req, res) => {
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

        const followUps = await FollowUp.find({
            patientId: patient._id
        })
            .populate("doctorId", "fullName specialization")
            .populate("appointmentId", "appointmentId date startTime endTime")
            .sort({ followUpDate: 1 });

        res.status(200).json({
            success: true,
            count: followUps.length,
            followUps
        });

    } catch (error) {
        console.error("Get My Follow-ups Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching follow-ups"
        });
    }
};


// GET DOCTOR FOLLOW-UPS
export const getDoctorFollowUps = async (req, res) => {
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

        const followUps = await FollowUp.find({
            doctorId: doctor._id
        })
            .populate("patientId", "patientId fullName phone")
            .populate("appointmentId", "appointmentId date startTime endTime")
            .sort({ followUpDate: 1 });

        res.status(200).json({
            success: true,
            count: followUps.length,
            followUps
        });

    } catch (error) {
        console.error("Get Doctor Follow-ups Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching follow-ups"
        });
    }
};


// GET FOLLOW-UPS FOR A PATIENT
export const getPatientFollowUps = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // If doctor is requesting, allow only their own follow-ups
        let filter = {
            patientId
        };

        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({
                userId: req.user.userId
            });

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found"
                });
            }

            filter.doctorId = doctor._id;
        }

        const followUps = await FollowUp.find(filter)
            .populate("doctorId", "fullName specialization")
            .populate("appointmentId", "appointmentId date startTime endTime")
            .sort({ followUpDate: 1 });

        res.status(200).json({
            success: true,
            count: followUps.length,
            followUps
        });

    } catch (error) {
        console.error("Get Patient Follow-ups Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching patient follow-ups"
        });
    }
};


// GET FOLLOW-UP BY ID
export const getFollowUpById = async (req, res) => {
    try {
        const { id } = req.params;

        const followUp = await FollowUp.findById(id)
            .populate("patientId", "patientId fullName phone email")
            .populate("doctorId", "fullName specialization")
            .populate("appointmentId", "appointmentId date startTime endTime");

        if (!followUp) {
            return res.status(404).json({
                success: false,
                message: "Follow-up not found"
            });
        }

        // Patient can only see their own follow-up
        if (req.user.role === "patient") {
            const patient = await Patient.findOne({
                userId: req.user.userId
            });

            if (
                !patient ||
                followUp.patientId._id.toString() !== patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Doctor can only see their own follow-up
        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({
                userId: req.user.userId
            });

            if (
                !doctor ||
                followUp.doctorId._id.toString() !== doctor._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        res.status(200).json({
            success: true,
            followUp
        });

    } catch (error) {
        console.error("Get Follow-up Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching follow-up"
        });
    }
};


// UPDATE FOLLOW-UP
export const updateFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            followUpDate,
            instructions,
            status,
            notes
        } = req.body;

        const followUp = await FollowUp.findById(id);

        if (!followUp) {
            return res.status(404).json({
                success: false,
                message: "Follow-up not found"
            });
        }

        // Doctor can update only their own follow-ups
        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({
                userId: req.user.userId
            });

            if (
                !doctor ||
                followUp.doctorId.toString() !== doctor._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You can only update your own follow-ups"
                });
            }
        }

        if (followUpDate !== undefined) {
            followUp.followUpDate = followUpDate;
        }

        if (instructions !== undefined) {
            followUp.instructions = instructions;
        }

        if (status !== undefined) {
            followUp.status = status;
        }

        if (notes !== undefined) {
            followUp.notes = notes;
        }

        await followUp.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_FOLLOW_UP",
    entityType: "FollowUp",
    entityId: followUp._id,
    metadata: {
        patientId: followUp.patientId,
        doctorId: followUp.doctorId,
        status: followUp.status
    }
});

        // Get patient for notification
        const patient = await Patient.findById(followUp.patientId);

        if (patient) {
            await createNotification({
                userId: patient.userId,
                title: "Follow-up Updated",
                message: `Your follow-up status is now ${followUp.status}.`,
                type: "followUp"
            });
        }

        res.status(200).json({
            success: true,
            message: "Follow-up updated successfully",
            followUp
        });

    } catch (error) {
        console.error("Update Follow-up Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating follow-up"
        });
    }
};