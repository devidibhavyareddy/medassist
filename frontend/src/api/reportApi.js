import api from './axios';

export const reportApi = {
  getClinicReports: () => api.get('/reports/clinic'),
};
