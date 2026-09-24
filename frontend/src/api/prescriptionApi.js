import api from './axios';

export const prescriptionApi = {
  createPrescription: (data) => api.post('/prescriptions', data),
  getMyPrescriptions: () => api.get('/prescriptions/my'),
  getDoctorPrescriptions: () => api.get('/prescriptions/doctor'),
  getPatientPrescriptions: (patientId) =>
    api.get(`/prescriptions/patient/${patientId}`),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  updatePrescription: (id, data) => api.put(`/prescriptions/${id}`, data),
};
