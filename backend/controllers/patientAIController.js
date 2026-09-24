import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";

import {
    explainPrescription
} from "../services/patientAIService.js";


// ========================================
// EXPLAIN PRESCRIPTION FOR PATIENT
// ========================================
export const getPrescriptionExplanation = async (
    req,
    res
) => {

    try {

        const { id } = req.params;


        // Find logged-in patient
        const patient = await Patient.findOne({
            userId: req.user.userId
        });


        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });

        }


        // Find prescription
        const prescription =
            await Prescription.findById(id);


        if (!prescription) {

            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });

        }


        // Make sure prescription belongs to patient
        if (
            prescription.patientId.toString() !==
            patient._id.toString()
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can only view explanations for your own prescriptions"
            });

        }


        // Generate explanation
        const explanation =
            await explainPrescription({

                medicines:
                    prescription.medicines,

                generalInstructions:
                    prescription.generalInstructions,

                followUpInstructions:
                    prescription.followUpInstructions

            });


        res.status(200).json({

            success: true,

            message:
                "Prescription explanation generated successfully",

            explanation,

            disclaimer:
                "This AI explanation is for educational purposes only. Follow your doctor's prescription and contact your doctor if you have questions."
        });


    } catch (error) {

        console.error(
            "Patient AI Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to generate prescription explanation"

        });

    }

};