import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Department from "./models/Department.js";
import Service from "./models/Service.js";
import Doctor from "./models/Doctor.js";
import Patient from "./models/Patient.js";
import Appointment from "./models/Appointment.js";
import Invoice from "./models/Invoice.js";
import LabOrder from "./models/LabOrder.js";

dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        // Clean existing test data
        await Promise.all([
            User.deleteMany({}),
            Department.deleteMany({}),
            Service.deleteMany({}),
            Doctor.deleteMany({}),
            Patient.deleteMany({}),
            Appointment.deleteMany({}),
            Invoice.deleteMany({}),
            LabOrder.deleteMany({}),
        ]);

        const password = await bcrypt.hash("123456", 10);

        // 1. Seed Core Users
        const [adminUser, doctorUser, receptionistUser, labUser, patientUser] = await User.insertMany([
            {
                name: "MedAssist Admin",
                email: "admin@medassist.com",
                password,
                phone: "9000000001",
                role: "admin",
                isActive: true
            },
            {
                name: "Dr. Arun Kumar",
                email: "doctor@medassist.com",
                password,
                phone: "9000000002",
                role: "doctor",
                isActive: true
            },
            {
                name: "MedAssist Receptionist",
                email: "receptionist@medassist.com",
                password,
                phone: "9000000003",
                role: "receptionist",
                isActive: true
            },
            {
                name: "MedAssist Lab Technician",
                email: "lab@medassist.com",
                password,
                phone: "9000000004",
                role: "labTechnician",
                isActive: true
            },
            {
                name: "Demo Patient",
                email: "patient@medassist.com",
                password,
                phone: "9000000005",
                role: "patient",
                isActive: true
            }
        ]);

        // 2. Seed Departments
        const [cardioDept, generalDept, neuroDept] = await Department.insertMany([
            {
                name: "Cardiology",
                description: "Cardiac diagnostics, electrophysiology, echocardiograms, and coronary wellness."
            },
            {
                name: "General Medicine",
                description: "Primary ambulatory consultations, preventive wellness, and routine family practice."
            },
            {
                name: "Neurology",
                description: "Central and peripheral nervous system diagnostics and neuromuscular evaluations."
            }
        ]);

        // 3. Seed Services
        await Service.insertMany([
            {
                name: "Comprehensive Cardiac Consult",
                description: "Full clinical exam, ECG interpretation, and cardiovascular risk assessment.",
                price: 150.00,
                department: cardioDept._id,
                status: "active"
            },
            {
                name: "Primary Care Consultation",
                description: "Standard outpatient consultation and acute care evaluation.",
                price: 75.00,
                department: generalDept._id,
                status: "active"
            },
            {
                name: "Complete Blood Count (CBC) Panel",
                description: "Evaluation of cellular blood components including erythrocytes, leukocytes, and platelets.",
                price: 45.00,
                department: generalDept._id,
                status: "active"
            }
        ]);

        // 4. Seed Doctor Profile linked to doctorUser
        const doctorProfile = await Doctor.create({
            userId: doctorUser._id,
            doctorId: "DOC-101",
            fullName: "Dr. Arun Kumar, MD",
            specialization: "Cardiology & Preventive Care",
            department: cardioDept._id,
            qualification: "MBBS, MD (Cardiology), FACC",
            experience: 12,
            consultationFee: 120.00,
            availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours: {
                start: "09:00",
                end: "17:00"
            },
            status: "active"
        });

        // 5. Seed Patient Profile linked to patientUser
        const patientProfile = await Patient.create({
            userId: patientUser._id,
            patientId: "PAT-1001",
            fullName: "Demo Patient",
            dateOfBirth: new Date("1988-06-15"),
            gender: "Male",
            phone: "9000000005",
            email: "patient@medassist.com",
            address: "42 Healthcare Boulevard, Metro City",
            emergencyContact: {
                name: "Sarah Patient",
                phone: "9000000099",
                relationship: "Spouse"
            },
            bloodGroup: "O+",
            allergies: ["Penicillin", "Sulfa drugs"]
        });

        // 6. Seed an Initial Appointment
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const appointment = await Appointment.create({
            appointmentId: "APT-2001",
            patientId: patientProfile._id,
            doctorId: doctorProfile._id,
            departmentId: cardioDept._id,
            date: tomorrow,
            startTime: "10:00",
            endTime: "10:30",
            reason: "Routine cardiovascular checkup and ECG assessment",
            status: "scheduled",
            queueNumber: 1,
            createdBy: receptionistUser._id
        });

        // 7. Seed a Diagnostic Lab Order
        await LabOrder.create({
            orderId: "LAB-3001",
            patientId: patientProfile._id,
            doctorId: doctorProfile._id,
            appointmentId: appointment._id,
            tests: [
                { testName: "Lipid Profile Panel" },
                { testName: "High-Sensitivity C-Reactive Protein (hs-CRP)" }
            ],
            priority: "normal",
            status: "sampleCollected",
            clinicalNote: "Evaluate lipid markers prior to statin titration.",
            orderedAt: new Date()
        });

        // 8. Seed an Invoice
        await Invoice.create({
            invoiceId: "INV-4001",
            patientId: patientProfile._id,
            appointmentId: appointment._id,
            items: [
                {
                    description: "Cardiology Specialist Consultation",
                    quantity: 1,
                    price: 120.00,
                    total: 120.00
                },
                {
                    description: "Baseline Electrocardiogram (ECG)",
                    quantity: 1,
                    price: 50.00,
                    total: 50.00
                }
            ],
            subtotal: 170.00,
            tax: 0.00,
            discount: 0.00,
            total: 170.00,
            paymentStatus: "paid",
            paymentMethod: "card",
            paidAt: new Date()
        });

        console.log("--------------------------------------------------");
        console.log("MedAssist comprehensive clinic dataset successfully seeded!");
        console.log("Credentials (Password for all: 123456):");
        console.log("- Admin:        admin@medassist.com");
        console.log("- Doctor:       doctor@medassist.com");
        console.log("- Receptionist: receptionist@medassist.com");
        console.log("- Lab Tech:     lab@medassist.com");
        console.log("- Patient:      patient@medassist.com");
        console.log("--------------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedUsers();