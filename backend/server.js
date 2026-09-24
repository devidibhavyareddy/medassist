import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import receptionistRoutes from "./routes/receptionistRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import followUpRoutes from "./routes/followUpRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import patientTimelineRoutes from "./routes/patientTimelineRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import patientAIRoutes from "./routes/patientAIRoutes.js";
import documentRoutes
    from "./routes/documentRoutes.js";

import {
    securityHeaders,
    apiLimiter
} from "./middleware/securityMiddleware.js";

import {
    errorHandler
} from "./middleware/errorMiddleware.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import reportRoutes from "./routes/reportRoutes.js";

const app = express();
app.use(securityHeaders);
app.use(apiLimiter);


connectDB();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/receptionist", receptionistRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/patient-timeline", patientTimelineRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);
app.use(
    "/api/patient-ai",
    patientAIRoutes
);
app.use(
    "/api/documents",
    documentRoutes
);
app.use("/api/dashboard", dashboardRoutes);
app.use(
    "/api/reports",
    reportRoutes
);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MedAssist Backend is Running"
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});