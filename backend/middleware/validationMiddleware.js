import validator from "validator";


// Validate email
export const validateEmail = (email) => {
    return validator.isEmail(email);
};


// Validate required fields
export const validateRequiredFields = (
    data,
    fields
) => {
    const missingFields = [];

    fields.forEach((field) => {
        if (
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ""
        ) {
            missingFields.push(field);
        }
    });

    return missingFields;
};