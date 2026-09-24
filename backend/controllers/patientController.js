import Patient from "../models/Patient.js";
import User from "../models/User.js";


// =====================================================
// CREATE PATIENT PROFILE
// =====================================================

export const createPatientProfile = async (req, res) => {
    try {
        const {
            fullName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContact,
            bloodGroup,
            allergies
        } = req.body;

        if (!fullName) {
            return res.status(400).json({
                success: false,
                message: "Full name is required"
            });
        }

        // Check whether profile already exists
        const existingPatient = await Patient.findOne({
            userId: req.user.userId
        });

        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: "Patient profile already exists"
            });
        }

        // Generate patient ID
        const patientCount = await Patient.countDocuments();

        const patientId = `PAT${String(
            patientCount + 1
        ).padStart(4, "0")}`;

        const patient = await Patient.create({
            userId: req.user.userId,
            patientId,
            fullName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContact,
            bloodGroup,
            allergies
        });

        res.status(201).json({
            success: true,
            message: "Patient profile created successfully",
            patient
        });

    } catch (error) {
        console.error("Create Patient Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating patient profile"
        });
    }
};


// =====================================================
// GET OWN PATIENT PROFILE
// =====================================================

export const getMyPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            userId: req.user.userId
        }).populate(
            "userId",
            "name email phone role"
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        res.status(200).json({
            success: true,
            patient
        });

    } catch (error) {
        console.error("Get Patient Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};


// =====================================================
// UPDATE OWN PATIENT PROFILE
// =====================================================

export const updateMyPatientProfile = async (req, res) => {
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

        const {
            fullName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContact,
            bloodGroup,
            allergies
        } = req.body;

        if (fullName !== undefined) {
            patient.fullName = fullName;
        }

        if (dateOfBirth !== undefined) {
            patient.dateOfBirth = dateOfBirth;
        }

        if (gender !== undefined) {
            patient.gender = gender;
        }

        if (phone !== undefined) {
            patient.phone = phone;
        }

        if (email !== undefined) {
            patient.email = email;
        }

        if (address !== undefined) {
            patient.address = address;
        }

        if (emergencyContact !== undefined) {
            patient.emergencyContact = emergencyContact;
        }

        if (bloodGroup !== undefined) {
            patient.bloodGroup = bloodGroup;
        }

        if (allergies !== undefined) {
            patient.allergies = allergies;
        }

        await patient.save();

        res.status(200).json({
            success: true,
            message: "Patient profile updated successfully",
            patient
        });

    } catch (error) {
        console.error("Update Patient Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating profile"
        });
    }
};