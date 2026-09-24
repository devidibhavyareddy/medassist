import User from "../models/User.js";
import Department from "../models/Department.js";
import Service from "../models/Service.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import { createAuditLog } from "../services/auditService.js";


// =====================================================
// USER MANAGEMENT
// =====================================================

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get Users Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching users"
        });
    }
};


// GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Get User Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching user"
        });
    }
};


// UPDATE USER ROLE
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const allowedRoles = [
            "admin",
            "doctor",
            "receptionist",
            "labTechnician",
            "patient"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;

        await user.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_USER_ROLE",
    entityType: "User",
    entityId: user._id,
    metadata: {
        newRole: user.role
    }
});

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Update Role Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating user role"
        });
    }
};


// ACTIVATE / DEACTIVATE USER
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isActive = !user.isActive;

        await user.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_USER_STATUS",
    entityType: "User",
    entityId: user._id,
    metadata: {
        isActive: user.isActive
    }
});

        res.status(200).json({
            success: true,
            message: `User ${
                user.isActive ? "activated" : "deactivated"
            } successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error("Toggle User Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating user status"
        });
    }
};


// =====================================================
// DEPARTMENT MANAGEMENT
// =====================================================

// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const existingDepartment = await Department.findOne({
            name
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: "Department already exists"
            });
        }

        const department = await Department.create({
            name,
            description
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });
    } catch (error) {
        console.error("Create Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating department"
        });
    }
};


// GET ALL DEPARTMENTS
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        console.error("Get Departments Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching departments"
        });
    }
};


// GET DEPARTMENT BY ID
export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            department
        });
    } catch (error) {
        console.error("Get Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching department"
        });
    }
};


// UPDATE DEPARTMENT
export const updateDepartment = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        const department = await Department.findById(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        if (name !== undefined) {
            department.name = name;
        }

        if (description !== undefined) {
            department.description = description;
        }

        if (status !== undefined) {
            department.status = status;
        }

        await department.save();

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department
        });
    } catch (error) {
        console.error("Update Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating department"
        });
    }
};


// DELETE DEPARTMENT
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        await Department.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Department deleted successfully"
        });
    } catch (error) {
        console.error("Delete Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting department"
        });
    }
};

// =====================================================
// SERVICE MANAGEMENT
// =====================================================

// CREATE SERVICE
export const createService = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            department
        } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Service name and price are required"
            });
        }

        // Check department if provided
        if (department) {
            const departmentExists =
                await Department.findById(department);

            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }
        }

        const existingService = await Service.findOne({
            name
        });

        if (existingService) {
            return res.status(400).json({
                success: false,
                message: "Service already exists"
            });
        }

        const service = await Service.create({
            name,
            description,
            price,
            department
        });

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            service
        });
    } catch (error) {
        console.error("Create Service Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating service"
        });
    }
};


// GET ALL SERVICES
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate("department", "name")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: services.length,
            services
        });
    } catch (error) {
        console.error("Get Services Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching services"
        });
    }
};


// GET SERVICE BY ID
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(
            req.params.id
        ).populate("department", "name");

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            service
        });
    } catch (error) {
        console.error("Get Service Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching service"
        });
    }
};


// UPDATE SERVICE
export const updateService = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            department,
            status
        } = req.body;

        const service = await Service.findById(
            req.params.id
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Check department if being changed
        if (department) {
            const departmentExists =
                await Department.findById(department);

            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            service.department = department;
        }

        if (name !== undefined) {
            service.name = name;
        }

        if (description !== undefined) {
            service.description = description;
        }

        if (price !== undefined) {
            service.price = price;
        }

        if (status !== undefined) {
            service.status = status;
        }

        await service.save();

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service
        });
    } catch (error) {
        console.error("Update Service Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating service"
        });
    }
};


// DELETE SERVICE
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(
            req.params.id
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        await Service.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        console.error("Delete Service Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting service"
        });
    }
};

// =====================================================
// DOCTOR MANAGEMENT
// =====================================================

// CREATE DOCTOR
export const createDoctor = async (req, res) => {
    try {
        const {
            userId,
            doctorId,
            fullName,
            specialization,
            department,
            qualification,
            experience,
            consultationFee,
            availableDays,
            workingHours
        } = req.body;

        if (
            !userId ||
            !doctorId ||
            !fullName ||
            !specialization ||
            !department
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "userId, doctorId, fullName, specialization and department are required"
            });
        }

        // Check user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // User must have doctor role
        if (user.role !== "doctor") {
            return res.status(400).json({
                success: false,
                message: "Selected user does not have doctor role"
            });
        }

        // Check if doctor profile already exists
        const existingDoctor = await Doctor.findOne({
            userId
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: "Doctor profile already exists for this user"
            });
        }

        // Check doctor ID
        const existingDoctorId = await Doctor.findOne({
            doctorId
        });

        if (existingDoctorId) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID already exists"
            });
        }

        // Check department
        const departmentExists = await Department.findById(
            department
        );

        if (!departmentExists) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        const doctor = await Doctor.create({
            userId,
            doctorId,
            fullName,
            specialization,
            department,
            qualification,
            experience,
            consultationFee,
            availableDays,
            workingHours
        });

        res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create Doctor Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating doctor"
        });
    }
};


// =====================================================
// GET ALL DOCTORS
// =====================================================

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate("userId", "name email phone isActive")
            .populate("department", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Get Doctors Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching doctors"
        });
    }
};


// =====================================================
// GET DOCTOR BY ID
// =====================================================

export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(
            req.params.id
        )
            .populate("userId", "name email phone isActive")
            .populate("department", "name");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            success: true,
            doctor
        });

    } catch (error) {
        console.error("Get Doctor Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching doctor"
        });
    }
};


// =====================================================
// UPDATE DOCTOR
// =====================================================

export const updateDoctor = async (req, res) => {
    try {
        const {
            fullName,
            specialization,
            department,
            qualification,
            experience,
            consultationFee,
            availableDays,
            workingHours,
            status
        } = req.body;

        const doctor = await Doctor.findById(
            req.params.id
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Check department if changed
        if (department !== undefined) {
            const departmentExists =
                await Department.findById(department);

            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            doctor.department = department;
        }

        if (fullName !== undefined) {
            doctor.fullName = fullName;
        }

        if (specialization !== undefined) {
            doctor.specialization = specialization;
        }

        if (qualification !== undefined) {
            doctor.qualification = qualification;
        }

        if (experience !== undefined) {
            doctor.experience = experience;
        }

        if (consultationFee !== undefined) {
            doctor.consultationFee = consultationFee;
        }

        if (availableDays !== undefined) {
            doctor.availableDays = availableDays;
        }

        if (workingHours !== undefined) {
            doctor.workingHours = workingHours;
        }

        if (status !== undefined) {
            doctor.status = status;
        }

        await doctor.save();

        res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update Doctor Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating doctor"
        });
    }
};


// =====================================================
// DELETE DOCTOR
// =====================================================

export const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(
            req.params.id
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        await Doctor.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Doctor profile deleted successfully"
        });

    } catch (error) {
        console.error("Delete Doctor Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting doctor"
        });
    }
};

// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

export const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const totalPatients = await Patient.countDocuments();

        const totalDoctors = await Doctor.countDocuments();

        const totalDepartments =
            await Department.countDocuments();

        const totalServices =
            await Service.countDocuments();

        const totalAppointments =
            await Appointment.countDocuments();

        const activeUsers =
            await User.countDocuments({
                isActive: true
            });

        const inactiveUsers =
            await User.countDocuments({
                isActive: false
            });

        res.status(200).json({
            success: true,

            dashboard: {
                totalUsers,
                totalPatients,
                totalDoctors,
                totalDepartments,
                totalServices,
                totalAppointments,
                activeUsers,
                inactiveUsers
            }
        });

    } catch (error) {
        console.error(
            "Admin Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching dashboard statistics"
        });
    }
};