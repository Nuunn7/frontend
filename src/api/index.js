import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
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

export const participationApi = {
  getAll: (params) => api.get('/participations', { params }),
  getById: (id) => api.get(`/participations/${id}`),
  reject: (id) => api.patch(`/participations/${id}/reject`),
  remove: (id) => api.delete(`/participations/${id}`),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  remove: (id) => api.delete(`/users/${id}`),
  getParticipations: (id) => api.get(`/users/${id}/participations`),
  getCertificates: (id) => api.get(`/users/${id}/certificates`),
};