import api from './axios';

export const dashboardApi = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getDoctorDashboard: () => api.get('/dashboard/doctor'),
  getReceptionistDashboard: () => api.get('/dashboard/receptionist'),
  getLabDashboard: () => api.get('/dashboard/lab'),
  getPatientDashboard: () => api.get('/dashboard/patient'),
};
