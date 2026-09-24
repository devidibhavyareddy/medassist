import MedicalDocument
    from "../models/MedicalDocument.js";

import Patient
    from "../models/Patient.js";

    import { createAuditLog } from "../services/auditService.js";


// ========================================
// UPLOAD DOCUMENT
// ========================================
export const uploadDocument = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please upload a file"

            });

        }


        const patientId =
            req.body.patientId;


        if (!patientId) {

            return res.status(400).json({

                success: false,

                message: "Patient ID is required"

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


        // Patient can upload only for themselves
        if (
            req.user.role === "patient" &&
            patient.userId.toString() !==
            req.user.userId.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only upload documents for yourself"

            });

        }


        const document =
            await MedicalDocument.create({

                patientId,

                uploadedBy:
                    req.user.userId,

                fileName:
                    req.file.filename,

                originalName:
                    req.file.originalname,

                filePath:
                    req.file.path,

                fileType:
                    req.file.mimetype,

                fileSize:
                    req.file.size,

                documentType:
                    req.body.documentType || "other"

            });
await createAuditLog({
    userId: req.user.userId,
    action: "UPLOAD_DOCUMENT",
    entityType: "MedicalDocument",
    entityId: document._id,
    metadata: {
        patientId: document.patientId,
        documentType: document.documentType,
        fileName: document.originalName
    }
});

        res.status(201).json({

            success: true,

            message:
                "Document uploaded successfully",

            document

        });


    } catch (error) {

        console.error(
            "Upload Document Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to upload document"

        });

    }

};



// ========================================
// GET PATIENT DOCUMENTS
// ========================================
export const getPatientDocuments = async (
    req,
    res
) => {

    try {

        const { patientId } =
            req.params;


        const patient =
            await Patient.findById(patientId);


        if (!patient) {

            return res.status(404).json({

                success: false,

                message: "Patient not found"

            });

        }


        // Patient can only see own documents
        if (
            req.user.role === "patient" &&
            patient.userId.toString() !==
            req.user.userId.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only view your own documents"

            });

        }


        const documents =
            await MedicalDocument.find({

                patientId

            })

            .populate(
                "uploadedBy",
                "name email role"
            )

            .sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            count: documents.length,

            documents

        });


    } catch (error) {

        console.error(
            "Get Documents Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to get documents"

        });

    }

};

// ========================================
// VIEW / DOWNLOAD DOCUMENT
// ========================================
export const getDocument = async (req, res) => {

    try {

        const { id } = req.params;

        // Find document
        const document =
            await MedicalDocument.findById(id);

        if (!document) {

            return res.status(404).json({
                success: false,
                message: "Document not found"
            });

        }


        // Find patient
        const patient =
            await Patient.findById(
                document.patientId
            );

        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        // Patient can only access own documents
        if (
            req.user.role === "patient" &&
            patient.userId.toString() !==
            req.user.userId.toString()
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can only access your own documents"
            });

        }


        // Send file
        res.sendFile(
            document.filePath,
            {
                root: process.cwd()
            },
            (error) => {

                if (error) {

                    console.error(
                        "Send File Error:",
                        error
                    );

                }

            }
        );

    } catch (error) {

        console.error(
            "Get Document Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to access document"
        });

    }

};