import api from './axios';

export const followUpApi = {
  createFollowUp: (data) => api.post('/follow-ups', data),
  getMyFollowUps: () => api.get('/follow-ups/my'),
  getDoctorFollowUps: () => api.get('/follow-ups/doctor'),
  getPatientFollowUps: (patientId) =>
    api.get(`/follow-ups/patient/${patientId}`),
  getFollowUpById: (id) => api.get(`/follow-ups/${id}`),
  updateFollowUp: (id, data) => api.put(`/follow-ups/${id}`, data),
};
