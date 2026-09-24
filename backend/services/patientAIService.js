import OpenAI from "openai";

const getOpenAI = () => new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


export const explainPrescription = async ({
    medicines,
    generalInstructions,
    followUpInstructions
}) => {

    const prompt = `
You are an AI assistant in a clinic management system.

Your job is to explain an existing doctor's prescription
in simple, patient-friendly language.

IMPORTANT RULES:

- Use ONLY the prescription information provided.
- Do not change the dosage.
- Do not change the frequency.
- Do not change the duration.
- Do not recommend new medicines.
- Do not diagnose the patient.
- Do not suggest stopping or changing treatment.
- Do not invent medical information.
- If something is unclear, say that the patient should ask their doctor.
- Clearly state that this explanation does not replace medical advice.

Prescription:

Medicines:
${JSON.stringify(medicines)}

General Instructions:
${generalInstructions || "None provided"}

Follow-up Instructions:
${followUpInstructions || "None provided"}

Explain this prescription in simple language that a patient
without medical knowledge can understand.
`;

    const response = await getOpenAI().responses.create({

        model:
            process.env.OPENAI_MODEL ||
            "gpt-5.6-luna",

        input: prompt

    });

    return response.output_text;
};