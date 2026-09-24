import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { createAuditLog } from "../services/auditService.js";


// =====================================================
// CREATE MEDICAL RECORD
// =====================================================

export const createMedicalRecord = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentId,
            chiefComplaint,
            symptoms,
            examinationFindings,
            diagnosis,
            clinicalNotes,
            treatmentPlan,
            followUpDate
        } = req.body;


        // Basic validation
        if (!patientId || !doctorId) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient ID and Doctor ID are required"
            });
        }


        // Check patient
        const patient =
            await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        // Check doctor
        const doctor =
            await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }


        // If appointment is provided,
        // check that it exists
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


            // Make sure appointment belongs
            // to the same patient and doctor
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


        // If logged-in user is a doctor,
        // make sure they are creating
        // the record for themselves
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
                        "You can only create records for your own patients"
                });
            }
        }


        const medicalRecord =
            await MedicalRecord.create({
                patientId,
                doctorId,
                appointmentId,
                chiefComplaint,
                symptoms,
                examinationFindings,
                diagnosis,
                clinicalNotes,
                treatmentPlan,
                followUpDate
            });

            await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_MEDICAL_RECORD",
    entityType: "MedicalRecord",
    entityId: medicalRecord._id,
    metadata: {
        patientId: medicalRecord.patientId,
        doctorId: medicalRecord.doctorId
    }
});


        // If appointment exists,
        // mark it as completed
        if (appointmentId) {

            await Appointment.findByIdAndUpdate(
                appointmentId,
                {
                    status: "completed"
                }
            );
        }


        res.status(201).json({
            success: true,
            message:
                "Medical record created successfully",
            medicalRecord
        });

    } catch (error) {

        console.error(
            "Create Medical Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating medical record"
        });
    }
};



// =====================================================
// GET MEDICAL RECORD BY ID
// =====================================================

export const getMedicalRecordById = async (
    req,
    res
) => {
    try {

        const medicalRecord =
            await MedicalRecord.findById(
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


        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical record not found"
            });
        }


        // Patient can only access
        // their own medical record
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });


            if (
                !patient ||
                medicalRecord.patientId._id.toString() !==
                    patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        // Doctor can only access
        // records belonging to their patients
        if (req.user.role === "doctor") {

            const doctor =
                await Doctor.findOne({
                    userId: req.user.userId
                });


            if (
                !doctor ||
                medicalRecord.doctorId._id.toString() !==
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
            medicalRecord
        });

    } catch (error) {

        console.error(
            "Get Medical Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching medical record"
        });
    }
};



// =====================================================
// GET PATIENT MEDICAL HISTORY
// =====================================================

export const getPatientMedicalRecords = async (
    req,
    res
) => {
    try {

        let patientId;


        // Patient requests their own records
        if (req.user.role === "patient") {

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


            patientId = patient._id;

        } else {

            // Doctor / Admin / Receptionist
            // provide patientId
            patientId = req.params.patientId;
        }


        const patient =
            await Patient.findById(
                patientId
            );


        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        const records =
            await MedicalRecord.find({
                patientId
            })
                .populate(
                    "doctorId",
                    "doctorId fullName specialization"
                )
                .populate(
                    "appointmentId",
                    "appointmentId date startTime endTime status"
                )
                .sort({
                    visitDate: -1
                });


        res.status(200).json({
            success: true,
            count: records.length,
            records
        });

    } catch (error) {

        console.error(
            "Get Patient Medical Records Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching medical history"
        });
    }
};



// =====================================================
// UPDATE MEDICAL RECORD
// =====================================================

export const updateMedicalRecord = async (
    req,
    res
) => {
    try {

        const medicalRecord =
            await MedicalRecord.findById(
                req.params.id
            );


        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical record not found"
            });
        }


        // Only doctor who created the
        // record can update it
        if (req.user.role === "doctor") {

            const doctor =
                await Doctor.findOne({
                    userId: req.user.userId
                });


            if (
                !doctor ||
                medicalRecord.doctorId.toString() !==
                    doctor._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only update your own medical records"
                });
            }
        }


        const {
            chiefComplaint,
            symptoms,
            examinationFindings,
            diagnosis,
            clinicalNotes,
            treatmentPlan,
            followUpDate
        } = req.body;


        if (
            chiefComplaint !== undefined
        ) {
            medicalRecord.chiefComplaint =
                chiefComplaint;
        }


        if (
            symptoms !== undefined
        ) {
            medicalRecord.symptoms =
                symptoms;
        }


        if (
            examinationFindings !== undefined
        ) {
            medicalRecord.examinationFindings =
                examinationFindings;
        }


        if (
            diagnosis !== undefined
        ) {
            medicalRecord.diagnosis =
                diagnosis;
        }


        if (
            clinicalNotes !== undefined
        ) {
            medicalRecord.clinicalNotes =
                clinicalNotes;
        }


        if (
            treatmentPlan !== undefined
        ) {
            medicalRecord.treatmentPlan =
                treatmentPlan;
        }


        if (
            followUpDate !== undefined
        ) {
            medicalRecord.followUpDate =
                followUpDate;
        }


        await medicalRecord.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_MEDICAL_RECORD",
    entityType: "MedicalRecord",
    entityId: medicalRecord._id,
    metadata: {
        patientId: medicalRecord.patientId,
        doctorId: medicalRecord.doctorId
    }
});


        res.status(200).json({
            success: true,
            message:
                "Medical record updated successfully",
            medicalRecord
        });

    } catch (error) {

        console.error(
            "Update Medical Record Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating medical record"
        });
    }
};



// =====================================================
// GET DOCTOR'S MEDICAL RECORDS
// =====================================================

export const getDoctorMedicalRecords = async (
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
                message:
                    "Doctor profile not found"
            });
        }


        const records =
            await MedicalRecord.find({
                doctorId: doctor._id
            })
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "appointmentId",
                    "appointmentId date startTime endTime status"
                )
                .sort({
                    visitDate: -1
                });


        res.status(200).json({
            success: true,
            count: records.length,
            records
        });

    } catch (error) {

        console.error(
            "Get Doctor Medical Records Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching doctor records"
        });
    }
};