import api from './axios';

export const appointmentApi = {
  createAppointment: (data) => api.post('/appointment', data),
  getMyAppointments: () => api.get('/appointment/my'),
  getAllAppointments: () => api.get('/appointment/all'),
  getDoctorAppointments: () => api.get('/appointment/doctor'),
  getTodayAppointments: () => api.get('/appointment/today'),
  checkDoctorAvailability: (doctorId, date) =>
    api.get(`/appointment/availability?doctorId=${doctorId}&date=${date}`),
  getDoctorQueue: (doctorId) =>
    api.get(`/appointment/queue?doctorId=${doctorId}`),
  getAppointmentById: (id) => api.get(`/appointment/${id}`),
  cancelAppointment: (id) => api.put(`/appointment/${id}/cancel`),
  updateAppointmentStatus: (id, status) =>
    api.put(`/appointment/${id}/status`, { status }),
  rescheduleAppointment: (id, { date, startTime, endTime }) =>
    api.put(`/appointment/${id}/reschedule`, { date, startTime, endTime }),
};
