import api from './axios';

export const aiApi = {
  generateClinicalSummary: (medicalRecordId) =>
    api.post(`/ai/clinical-summary/${medicalRecordId}`),
  approveClinicalSummary: (medicalRecordId, aiSummary) =>
    api.put(`/ai/clinical-summary/${medicalRecordId}/approve`, { aiSummary }),
  getPrescriptionExplanation: (prescriptionId) =>
    api.post(`/patient-ai/prescription/${prescriptionId}/explanation`),
};
