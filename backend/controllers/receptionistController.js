import Patient from "../models/Patient.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";


// =====================================================
// CREATE PATIENT BY STAFF
// =====================================================

export const createPatientByStaff = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            fullName,
            dateOfBirth,
            gender,
            address,
            emergencyContact,
            bloodGroup,
            allergies
        } = req.body;

        if (!name || !email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password and fullName are required"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "patient"
        });

        const patientCount =
            await Patient.countDocuments();

        const patientId = `PAT${String(
            patientCount + 1
        ).padStart(4, "0")}`;

        const patient = await Patient.create({
            userId: user._id,
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
            message: "Patient registered successfully",
            patient
        });

    } catch (error) {
        console.error(
            "Staff Create Patient Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while registering patient"
        });
    }
};