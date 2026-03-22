import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const activityApi = {
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  join: (id) => api.post(`/activities/${id}/join`),
  verifyParticipation: (activityId, userId, data) =>
    api.post(`/activities/${activityId}/verify/${userId}`, data),
    getParticipations: (id) => api.get(`/activities/${id}/participations`),
};

export const certificateApi = {
  getMyCertificates: () => api.get('/certificates'),
  getById: (id) => api.get(`/certificates/${id}`),
  issue: (participationId) => api.post(`/certificates/issue/${participationId}`),
  verify: (hash) => api.get(`/certificates/verify/${hash}`),
};