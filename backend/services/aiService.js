import OpenAI from "openai";

const getOpenAI = () => new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateClinicalSummary = async ({
    chiefComplaint,
    symptoms,
    examinationFindings,
    diagnosis,
    clinicalNotes,
    treatmentPlan,
    followUpDate
}) => {

    const prompt = `
You are an AI assistant inside a clinic management system.

Your task is ONLY to summarize the clinical information provided by a doctor.

IMPORTANT RULES:
- Do not invent medical information.
- Do not add symptoms that were not provided.
- Do not create a new diagnosis.
- Do not recommend medicines.
- Do not change dosage, frequency, or treatment.
- Do not give independent medical advice.
- Use only the information provided.
- The final summary must be reviewed by the doctor.

Clinical Information:

Chief Complaint:
${chiefComplaint || "Not provided"}

Symptoms:
${symptoms?.join(", ") || "Not provided"}

Examination Findings:
${examinationFindings || "Not provided"}

Diagnosis:
${diagnosis || "Not provided"}

Clinical Notes:
${clinicalNotes || "Not provided"}

Treatment Plan:
${treatmentPlan || "Not provided"}

Follow-up Date:
${followUpDate || "Not provided"}

Generate a concise clinical summary suitable for review by the doctor.
`;

    const response = await getOpenAI().responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input: prompt
    });

    return response.output_text;
};