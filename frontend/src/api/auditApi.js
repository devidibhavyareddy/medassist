import api from './axios';

export const auditApi = {
  getAll: () => api.get('/audit-logs'),
  getByUser: (userId) => api.get(`/audit-logs/user/${userId}`),
  getById: (id) => api.get(`/audit-logs/${id}`),
};
