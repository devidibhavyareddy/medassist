import multer from "multer";
import path from "path";


// Storage configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});


// Allowed file types
const allowedTypes = [

    "application/pdf",

    "image/jpeg",
    "image/png",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

];


// File filter
const fileFilter = (req, file, cb) => {

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only PDF, JPG, PNG, DOC and DOCX files are allowed"
            ),
            false
        );

    }

};


// Upload configuration
const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});


export default upload;