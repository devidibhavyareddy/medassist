import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { createNotification } from "../services/notificationService.js";
import { createAuditLog } from "../services/auditService.js";
// =====================================================
// CREATE APPOINTMENT
// =====================================================

export const createAppointment = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            departmentId,
            date,
            startTime,
            endTime,
            reason
        } = req.body;

        // Basic validation
        if (
            !doctorId ||
            !departmentId ||
            !date ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor, department, date, start time and end time are required"
            });
        }

        // Validate time
        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        // ---------------------------------------------
        // Find patient
        // ---------------------------------------------

        let patient;

        // If logged-in user is a patient,
        // automatically find their patient profile
        if (req.user.role === "patient") {

            patient = await Patient.findOne({
                userId: req.user.userId
            });

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: "Patient profile not found"
                });
            }

        } else {

            // Admin / Receptionist must provide patientId
            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: "Patient ID is required"
                });
            }

            patient = await Patient.findById(patientId);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found"
                });
            }
        }


        // ---------------------------------------------
        // Find doctor
        // ---------------------------------------------

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        if (doctor.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Doctor is currently inactive"
            });
        }


        // ---------------------------------------------
        // Check doctor working day
        // ---------------------------------------------

        const appointmentDate = new Date(date);

        const dayName = appointmentDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );

        if (
            doctor.availableDays.length > 0 &&
            !doctor.availableDays.includes(dayName)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Doctor is not available on ${dayName}`
            });
        }


        // ---------------------------------------------
        // Check working hours
        // ---------------------------------------------

        if (
            doctor.workingHours &&
            doctor.workingHours.start &&
            doctor.workingHours.end
        ) {
            if (
                startTime < doctor.workingHours.start ||
                endTime > doctor.workingHours.end
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Appointment time is outside doctor's working hours"
                });
            }
        }


        // ---------------------------------------------
        // Check appointment conflict
        // ---------------------------------------------

        const conflict = await Appointment.findOne({
            doctorId,
            date: appointmentDate,
            status: {
                $ne: "cancelled"
            },
            startTime: {
                $lt: endTime
            },
            endTime: {
                $gt: startTime
            }
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message:
                    "Doctor is already booked for this time"
            });
        }


        // ---------------------------------------------
        // Generate appointment ID
        // ---------------------------------------------

        const appointmentCount =
            await Appointment.countDocuments();

        const appointmentId =
            `APT${String(
                appointmentCount + 1
            ).padStart(4, "0")}`;


        // ---------------------------------------------
        // Generate queue number
        // ---------------------------------------------

        const queueCount =
            await Appointment.countDocuments({
                doctorId,
                date: appointmentDate,
                status: {
                    $in: [
                        "requested",
                        "scheduled",
                        "checkedIn",
                        "inConsultation"
                    ]
                }
            });

        const queueNumber = queueCount + 1;


        // ---------------------------------------------
        // Create appointment
        // ---------------------------------------------

        const appointment =
            await Appointment.create({
                appointmentId,
                patientId: patient._id,
                doctorId,
                departmentId,
                date: appointmentDate,
                startTime,
                endTime,
                reason,
                status: "scheduled",
                queueNumber,
                createdBy: req.user.userId
            });

            await createAuditLog({
    userId: req.user.userId,
    action: "CREATE_APPOINTMENT",
    entityType: "Appointment",
    entityId: appointment._id,
    metadata: {
        appointmentId: appointment.appointmentId
    }
});

        // Notify patient
        if (patient) {
            await createNotification({
                userId: patient.userId,
                title: "Appointment Scheduled",
                message: `Your appointment has been scheduled for ${date} from ${startTime} to ${endTime}.`,
                type: "appointment"
            });
        }

        // Notify doctor
        if (doctor) {
            await createNotification({
                userId: doctor.userId,
                title: "New Appointment",
                message: `A new appointment has been scheduled for ${date} from ${startTime} to ${endTime}.`,
                type: "appointment"
            });
        }


        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment
        });

    } catch (error) {

        console.error(
            "Create Appointment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating appointment"
        });
    }
};



// =====================================================
// GET MY APPOINTMENTS - PATIENT
// =====================================================

export const getMyAppointments = async (req, res) => {
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


        const appointments =
            await Appointment.find({
                patientId: patient._id
            })
                .populate(
                    "doctorId",
                    "doctorId fullName specialization consultationFee"
                )
                .populate(
                    "departmentId",
                    "name"
                )
                .sort({
                    date: 1,
                    startTime: 1
                });


        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {

        console.error(
            "Get Patient Appointments Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching appointments"
        });
    }
};



// =====================================================
// GET ALL APPOINTMENTS - ADMIN / RECEPTIONIST
// =====================================================

export const getAllAppointments = async (req, res) => {
    try {

        const appointments =
            await Appointment.find()
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "doctorId",
                    "doctorId fullName specialization"
                )
                .populate(
                    "departmentId",
                    "name"
                )
                .sort({
                    date: 1,
                    startTime: 1
                });


        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {

        console.error(
            "Get All Appointments Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching appointments"
        });
    }
};



// =====================================================
// GET DOCTOR APPOINTMENTS
// =====================================================

export const getDoctorAppointments = async (req, res) => {
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


        const appointments =
            await Appointment.find({
                doctorId: doctor._id
            })
                .populate(
                    "patientId",
                    "patientId fullName phone email"
                )
                .populate(
                    "departmentId",
                    "name"
                )
                .sort({
                    date: 1,
                    startTime: 1
                });


        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {

        console.error(
            "Get Doctor Appointments Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching doctor appointments"
        });
    }
};



// =====================================================
// GET APPOINTMENT BY ID
// =====================================================

export const getAppointmentById = async (req, res) => {
    try {

        const appointment =
            await Appointment.findById(
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
                    "departmentId",
                    "name"
                );


        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        // ---------------------------------------------
        // Patient authorization
        // ---------------------------------------------

        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });

            if (
                !patient ||
                appointment.patientId._id.toString() !==
                    patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        // ---------------------------------------------
        // Doctor authorization
        // ---------------------------------------------

        if (req.user.role === "doctor") {

            const doctor =
                await Doctor.findOne({
                    userId: req.user.userId
                });

            if (
                !doctor ||
                appointment.doctorId._id.toString() !==
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
            appointment
        });

    } catch (error) {

        console.error(
            "Get Appointment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching appointment"
        });
    }
};



// =====================================================
// CANCEL APPOINTMENT
// =====================================================

export const cancelAppointment = async (req, res) => {
    try {

        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        // Patient can cancel only their own appointment
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });

            if (
                !patient ||
                appointment.patientId.toString() !==
                    patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        if (
            appointment.status === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment is already cancelled"
            });
        }


        appointment.status = "cancelled";

        await appointment.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "CANCEL_APPOINTMENT",
    entityType: "Appointment",
    entityId: appointment._id,
    metadata: {
        appointmentId: appointment.appointmentId
    }
});

        const patient = await Patient.findById(
    appointment.patientId
);

const doctor = await Doctor.findById(
    appointment.doctorId
);

if (patient) {
    await createNotification({
        userId: patient.userId,
        title: "Appointment Cancelled",
        message: `Your appointment scheduled for ${appointment.date.toDateString()} has been cancelled.`,
        type: "appointment"
    });
}

if (doctor) {
    await createNotification({
        userId: doctor.userId,
        title: "Appointment Cancelled",
        message: `An appointment scheduled for ${appointment.date.toDateString()} has been cancelled.`,
        type: "appointment"
    });
}


        res.status(200).json({
            success: true,
            message:
                "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {

        console.error(
            "Cancel Appointment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while cancelling appointment"
        });
    }
};



// =====================================================
// UPDATE APPOINTMENT STATUS
// =====================================================

export const updateAppointmentStatus = async (
    req,
    res
) => {
    try {

        const { status } = req.body;


        const allowedStatuses = [
            "requested",
            "scheduled",
            "checkedIn",
            "inConsultation",
            "completed",
            "cancelled",
            "noShow"
        ];


        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment status"
            });
        }


        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        appointment.status = status;

        await appointment.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "UPDATE_APPOINTMENT_STATUS",
    entityType: "Appointment",
    entityId: appointment._id,
    metadata: {
        appointmentId: appointment.appointmentId,
        newStatus: status
    }
});

        // Notify patient
const patient = await Patient.findById(
    appointment.patientId
);

if (patient) {
    await createNotification({
        userId: patient.userId,
        title: "Appointment Status Updated",
        message: `Your appointment status has been updated to ${status}.`,
        type: "appointment"
    });
}


        res.status(200).json({
            success: true,
            message:
                "Appointment status updated successfully",
            appointment
        });

    } catch (error) {

        console.error(
            "Update Appointment Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating appointment status"
        });
    }
};



// =====================================================
// RESCHEDULE APPOINTMENT
// =====================================================

export const rescheduleAppointment = async (
    req,
    res
) => {
    try {

        const {
            date,
            startTime,
            endTime
        } = req.body;


        if (
            !date ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Date, start time and end time are required"
            });
        }


        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time"
            });
        }


        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        if (
            appointment.status === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cancelled appointment cannot be rescheduled"
            });
        }


        // Patient can only reschedule their own appointment
        if (req.user.role === "patient") {

            const patient =
                await Patient.findOne({
                    userId: req.user.userId
                });

            if (
                !patient ||
                appointment.patientId.toString() !==
                    patient._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        const newDate = new Date(date);


        // Check for another appointment
        const conflict =
            await Appointment.findOne({
                _id: {
                    $ne: appointment._id
                },
                doctorId: appointment.doctorId,
                date: newDate,
                status: {
                    $ne: "cancelled"
                },
                startTime: {
                    $lt: endTime
                },
                endTime: {
                    $gt: startTime
                }
            });


        if (conflict) {
            return res.status(409).json({
                success: false,
                message:
                    "Doctor is already booked for this time"
            });
        }


        appointment.date = newDate;
        appointment.startTime = startTime;
        appointment.endTime = endTime;


        // Recalculate queue number
        const queueCount =
            await Appointment.countDocuments({
                doctorId: appointment.doctorId,
                date: newDate,
                status: {
                    $in: [
                        "requested",
                        "scheduled",
                        "checkedIn",
                        "inConsultation"
                    ]
                },
                _id: {
                    $ne: appointment._id
                }
            });


        appointment.queueNumber =
            queueCount + 1;


        await appointment.save();

        await createAuditLog({
    userId: req.user.userId,
    action: "RESCHEDULE_APPOINTMENT",
    entityType: "Appointment",
    entityId: appointment._id,
    metadata: {
        appointmentId: appointment.appointmentId,
        newDate: date,
        newStartTime: startTime,
        newEndTime: endTime
    }
});

        const patient = await Patient.findById(
    appointment.patientId
);

const doctor = await Doctor.findById(
    appointment.doctorId
);

if (patient) {
    await createNotification({
        userId: patient.userId,
        title: "Appointment Rescheduled",
        message: `Your appointment has been rescheduled to ${date} from ${startTime} to ${endTime}.`,
        type: "appointment"
    });
}

if (doctor) {
    await createNotification({
        userId: doctor.userId,
        title: "Appointment Rescheduled",
        message: `An appointment has been rescheduled to ${date} from ${startTime} to ${endTime}.`,
        type: "appointment"
    });
}   


        res.status(200).json({
            success: true,
            message:
                "Appointment rescheduled successfully",
            appointment
        });

    } catch (error) {

        console.error(
            "Reschedule Appointment Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while rescheduling appointment"
        });
    }
};



// =====================================================
// CHECK DOCTOR AVAILABILITY
// =====================================================

export const checkDoctorAvailability = async (
    req,
    res
) => {
    try {

        const {
            doctorId,
            date,
            startTime,
            endTime
        } = req.query;


        if (
            !doctorId ||
            !date ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor, date, start time and end time are required"
            });
        }


        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message:
                    "End time must be after start time"
            });
        }


        const doctor =
            await Doctor.findById(
                doctorId
            );


        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }


        if (doctor.status !== "active") {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor is currently inactive"
            });
        }


        const requestedDate =
            new Date(date);


        // ---------------------------------------------
        // Check available day
        // ---------------------------------------------

        const dayName =
            requestedDate.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        if (
            doctor.availableDays.length > 0 &&
            !doctor.availableDays.includes(
                dayName
            )
        ) {
            return res.status(200).json({
                success: true,
                available: false,
                message:
                    "Doctor is not available on this day"
            });
        }


        // ---------------------------------------------
        // Check working hours
        // ---------------------------------------------

        if (
            doctor.workingHours &&
            doctor.workingHours.start &&
            doctor.workingHours.end
        ) {

            if (
                startTime <
                    doctor.workingHours.start ||
                endTime >
                    doctor.workingHours.end
            ) {
                return res.status(200).json({
                    success: true,
                    available: false,
                    message:
                        "Requested time is outside doctor's working hours"
                });
            }
        }


        // ---------------------------------------------
        // Check existing appointment
        // ---------------------------------------------

        const conflict =
            await Appointment.findOne({
                doctorId,
                date: requestedDate,
                status: {
                    $ne: "cancelled"
                },
                startTime: {
                    $lt: endTime
                },
                endTime: {
                    $gt: startTime
                }
            });


        if (conflict) {
            return res.status(200).json({
                success: true,
                available: false,
                message:
                    "Doctor is already booked for this time"
            });
        }


        res.status(200).json({
            success: true,
            available: true,
            message:
                "Doctor is available"
        });

    } catch (error) {

        console.error(
            "Check Doctor Availability Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while checking availability"
        });
    }
};



// =====================================================
// GET DOCTOR QUEUE
// =====================================================

export const getDoctorQueue = async (
    req,
    res
) => {
    try {

        const {
            doctorId,
            date
        } = req.query;


        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor ID and date are required"
            });
        }


        const appointments =
            await Appointment.find({
                doctorId,
                date: new Date(date),
                status: {
                    $in: [
                        "scheduled",
                        "checkedIn",
                        "inConsultation"
                    ]
                }
            })
                .populate(
                    "patientId",
                    "patientId fullName phone"
                )
                .sort({
                    queueNumber: 1
                });


        res.status(200).json({
            success: true,
            count: appointments.length,
            queue: appointments
        });

    } catch (error) {

        console.error(
            "Get Doctor Queue Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching queue"
        });
    }
};

// ==========================================
// GET TODAY'S APPOINTMENTS
// ==========================================

export const getTodayAppointments = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let filter = {
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
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

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({
                userId: req.user.userId
            });

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: "Patient profile not found"
                });
            }

            filter.patientId = patient._id;
        }

        const appointments =
            await Appointment.find(filter)
                .populate(
                    "patientId",
                    "patientId fullName phone"
                )
                .populate(
                    "doctorId",
                    "doctorId fullName specialization"
                )
                .sort({
                    startTime: 1
                });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error(
            "Today's Appointments Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load today's appointments"
        });
    }
};

