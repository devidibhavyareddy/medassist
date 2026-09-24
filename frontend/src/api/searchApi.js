import api from './axios';

export const searchApi = {
  searchPatients: (query) => api.get(`/search/patients?search=${encodeURIComponent(query || '')}`),
  searchDoctors: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/search/doctors?${searchParams.toString()}`);
  },
  filterAppointments: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/search/appointments?${searchParams.toString()}`);
  },
  filterLabOrders: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/search/lab-orders?${searchParams.toString()}`);
  },
  filterInvoices: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/search/invoices?${searchParams.toString()}`);
  },
};
