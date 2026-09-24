import api from './axios';

export const patientTimelineApi = {
  getTimeline: (patientId) => api.get(`/patient-timeline/${patientId}`),
};
