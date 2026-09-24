import api from './axios';

export const patientApi = {
  getMyProfile: () => api.get('/patient/profile'),
  createMyProfile: (data) => api.post('/patient/profile', data),
  updateMyProfile: (data) => api.put('/patient/profile', data),
  createByStaff: (data) => api.post('/receptionist/patients', data),
};
