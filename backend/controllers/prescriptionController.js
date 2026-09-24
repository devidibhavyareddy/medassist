import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { createAuditLog } from "../services/auditService.js";

// =====================================================
// CREATE PRESCRIPTION
// =====================================================

export const createPrescription = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentId,
            medicines,
            generalInstructions,
            followUpInstructions
        } = req.body;

        if (!patientId || !doctorId || !medicines) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient ID, Doctor ID and medicines are required"
            });
        }

        if (
            !Array.isArray(medicines) ||
            medicines.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one medicine is required"
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


        // Doctor can only create prescriptions
        // for themselves
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
                        "You can only create prescriptions for your patients"
                });
            }
        }


        // Check appointment if provided
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


        // Validate medicines
        for (const medicine of medicines) {

            if (
                !medicine.medicineName ||
                !medicine.dosage ||
                !medicine.frequency ||
                !medicine.duration
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each medicine must have name, dosage, frequency and duration"
                });
            }
        }


        const prescription =
            await Prescription.create({
                patientId,
                doctorId,
                appointmentId,
                medicines,
                generalInstructions,
                followUpInstructions
            });

            await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_PRESCRIPTION",
    entityType: "Prescription",
    entityId: prescription._id,
    metadata: {
        patientId: prescription.patientId,
        doctorId: prescription.doctorId
    }
});


        res.status(201).json({
            success: true,
            message:
                "Prescription created successfully",
            prescription
        });

    } catch (error) {

        console.error(
            "Create Prescription Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating prescription"
        });
    }
};



// =====================================================
// GET PATIENT PRESCRIPTIONS
// =====================================================

export const getMyPrescriptions = async (req, res) => {
    try {

        const patient =
            await Patient.findOne({
                userId: req.user.userId
            });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }


        const prescriptions =
            await Prescription.find({
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
            count: prescriptions.length,
            prescriptions
        });

    } catch (error) {

        console.error(
            "Get My Prescriptions Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching prescriptions"
        });
    }
};



// =====================================================
// GET PRESCRIPTION BY ID
// =====================================================

export const getPrescriptionById = async (
    req,
    res
) => {
    try {

        const prescription =
            await Prescription.findById(
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
                    "appointmentId date startTime endTime status"
                );


        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });
        }


        // Patient can only see own prescription
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });

            if (
                !patient ||
                prescription.patientId._id.toString() !==
                    patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        // Doctor can only see their prescriptions
        if (req.user.role === "doctor") {

            const doctor =
                await Doctor.findOne({
                    userId: req.user.userId
                });

            if (
                !doctor ||
                prescription.doctorId._id.toString() !==
                    doctor._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        res.status(200).json({
            success: true,
            prescription
        });

    } catch (error) {

        console.error(
            "Get Prescription Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching prescription"
        });
    }
};



// =====================================================
// GET DOCTOR PRESCRIPTIONS
// =====================================================

export const getDoctorPrescriptions = async (
    req,
    res
) => {
    try {

        const doctor =
            await Doctor.findOne({
                userId: req.user.userId
            });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }


        const prescriptions =
            await Prescription.find({
                doctorId: doctor._id
            })
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
            count: prescriptions.length,
            prescriptions
        });

    } catch (error) {

        console.error(
            "Get Doctor Prescriptions Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching doctor prescriptions"
        });
    }
};



// =====================================================
// UPDATE PRESCRIPTION
// =====================================================

export const updatePrescription = async (
    req,
    res
) => {
    try {

        const prescription =
            await Prescription.findById(
                req.params.id
            );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });
        }


        // Doctor authorization
        if (req.user.role === "doctor") {

            const doctor =
                await Doctor.findOne({
                    userId: req.user.userId
                });

            if (
                !doctor ||
                prescription.doctorId.toString() !==
                    doctor._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only update your own prescriptions"
                });
            }
        }


        const {
            medicines,
            generalInstructions,
            followUpInstructions,
            status
        } = req.body;


        if (medicines !== undefined) {

            if (
                !Array.isArray(medicines) ||
                medicines.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "At least one medicine is required"
                });
            }

            for (const medicine of medicines) {

                if (
                    !medicine.medicineName ||
                    !medicine.dosage ||
                    !medicine.frequency ||
                    !medicine.duration
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Each medicine must have name, dosage, frequency and duration"
                    });
                }
            }

            prescription.medicines = medicines;
        }


        if (
            generalInstructions !== undefined
        ) {
            prescription.generalInstructions =
                generalInstructions;
        }


        if (
            followUpInstructions !== undefined
        ) {
            prescription.followUpInstructions =
                followUpInstructions;
        }


        if (status !== undefined) {

            const allowedStatuses = [
                "active",
                "completed",
                "cancelled"
            ];

            if (
                !allowedStatuses.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid prescription status"
                });
            }

            prescription.status = status;
        }


        await prescription.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_PRESCRIPTION",
    entityType: "Prescription",
    entityId: prescription._id,
    metadata: {
        patientId: prescription.patientId,
        doctorId: prescription.doctorId
    }
});


        res.status(200).json({
            success: true,
            message:
                "Prescription updated successfully",
            prescription
        });

    } catch (error) {

        console.error(
            "Update Prescription Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating prescription"
        });
    }
};



// =====================================================
// GET PRESCRIPTIONS FOR A PATIENT
// Doctor / Admin / Receptionist
// =====================================================

export const getPatientPrescriptions = async (
    req,
    res
) => {
    try {

        const patient =
            await Patient.findById(
                req.params.patientId
            );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        const prescriptions =
            await Prescription.find({
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
            count: prescriptions.length,
            prescriptions
        });

    } catch (error) {

        console.error(
            "Get Patient Prescriptions Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching patient prescriptions"
        });
    }
};