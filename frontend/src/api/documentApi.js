import api from './axios';

export const documentApi = {
  uploadDocument: (formData) =>
    api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getPatientDocuments: (patientId) =>
    api.get(`/documents/patient/${patientId}`),
  getDocumentDownloadUrl: (id) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseURL}/documents/${id}`;
  },
  getDocumentBlob: (id) =>
    api.get(`/documents/${id}`, {
      responseType: 'blob',
    }),
};
