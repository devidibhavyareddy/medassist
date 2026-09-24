import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
    validateEmail,
    validateRequiredFields
} from "../middleware/validationMiddleware.js";

import { createAuditLog } from "../services/auditService.js";


// ========================================
// REGISTER
// ========================================
export const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone
        } = req.body;


        // Check required fields
        const missingFields = validateRequiredFields(
            req.body,
            ["name", "email", "password"]
        );


        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
                fields: missingFields
            });
        }


        // Validate email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }


        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }


        // Check if user already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });


        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create patient user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role: "patient"
        });

        await createAuditLog({
    userId: user._id,
    action: "REGISTER_USER",
    entityType: "User",
    entityId: user._id,
    metadata: {
        email: user.email,
        role: user.role
    }
});


        res.status(201).json({
            success: true,
            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Register Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};



// ========================================
// LOGIN
// ========================================
export const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;


        // Check required fields
        const missingFields = validateRequiredFields(
            req.body,
            ["email", "password"]
        );


        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                fields: missingFields
            });
        }


        // Validate email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }


        // Find user
        const user = await User.findOne({
            email: email.toLowerCase()
        });


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }


        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        // Update last login
        user.lastLogin = new Date();

        await user.save();

        await createAuditLog({
    userId: user._id,
    action: "LOGIN_USER",
    entityType: "User",
    entityId: user._id,
    metadata: {
        email: user.email,
        role: user.role
    }
});


        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        // Send response
        res.status(200).json({
            success: true,
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};