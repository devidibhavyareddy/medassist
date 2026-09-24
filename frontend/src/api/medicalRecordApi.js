import api from './axios';

export const medicalRecordApi = {
  createMedicalRecord: (data) => api.post('/medical-records', data),
  getMyMedicalRecords: () => api.get('/medical-records/my'),
  getDoctorMedicalRecords: () => api.get('/medical-records/doctor'),
  getPatientMedicalRecords: (patientId) =>
    api.get(`/medical-records/patient/${patientId}`),
  getMedicalRecordById: (id) => api.get(`/medical-records/${id}`),
  updateMedicalRecord: (id, data) => api.put(`/medical-records/${id}`, data),
};
