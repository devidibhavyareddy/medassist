import mongoose from "mongoose";


const medicalDocumentSchema = new mongoose.Schema(

    {
        patientId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Patient",

            required: true

        },

        uploadedBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        fileName: {

            type: String,

            required: true

        },

        originalName: {

            type: String,

            required: true

        },

        filePath: {

            type: String,

            required: true

        },

        fileType: {

            type: String,

            required: true

        },

        fileSize: {

            type: Number,

            required: true

        },

        documentType: {

            type: String,

            enum: [

                "labReport",

                "prescription",

                "medicalReport",

                "other"

            ],

            default: "other"

        }

    },

    {

        timestamps: true

    }

);


const MedicalDocument =
    mongoose.model(
        "MedicalDocument",
        medicalDocumentSchema
    );


export default MedicalDocument;