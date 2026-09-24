import api from './axios';

export const invoiceApi = {
  createInvoice: (data) => api.post('/invoices', data),
  getAllInvoices: () => api.get('/invoices'),
  getMyInvoices: () => api.get('/invoices/my'),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  recordPayment: (id, { paymentMethod, transactionReference }) =>
    api.put(`/invoices/${id}/payment`, { paymentMethod, transactionReference }),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  cancelInvoice: (id) => api.put(`/invoices/${id}/cancel`),
};
