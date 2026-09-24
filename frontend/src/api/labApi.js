import api from './axios';

export const labApi = {
  createLabOrder: (data) => api.post('/labs/orders', data),
  getAllLabOrders: () => api.get('/labs/orders'),
  getMyLabOrders: () => api.get('/labs/orders/my'),
  getLabOrderById: (id) => api.get(`/labs/orders/${id}`),
  updateLabOrderStatus: (id, status) =>
    api.put(`/labs/orders/${id}/status`, { status }),
  createLabResult: (data) => api.post('/labs/results', data),
  getLabResultByOrder: (labOrderId) =>
    api.get(`/labs/results/order/${labOrderId}`),
  verifyLabResult: (id) => api.put(`/labs/results/${id}/verify`),
  getMyLabResults: () => api.get('/labs/results/my'),
};
