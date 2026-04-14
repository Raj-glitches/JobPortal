import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (mobile, purpose) => api.post('/auth/send-otp', { mobile, purpose }),
  verifyOTP: (mobile, otp, purpose) => api.post('/auth/verify-otp', { mobile, otp, purpose }),
  register: (data) => api.post('/auth/register', data),
  login: (mobile, otp) => api.post('/auth/login', { mobile, otp }),
  loginWithPassword: (mobile, password) => api.post('/auth/login-password', { mobile, password }),
  googleAuth: (tokenId) => api.post('/auth/google', { tokenId }),
  forgotPassword: (mobile) => api.post('/auth/forgot-password', { mobile }),
  resetPassword: (mobile, otp, password) => api.post('/auth/reset-password', { mobile, otp, password }),
  getMe: () => api.get('/auth/me'),
  updatePassword: (currentPassword, newPassword) => api.put('/auth/update-password', { currentPassword, newPassword })
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateCompanyDetails: (data) => api.put('/users/company-details', data),
  uploadProfilePhoto: (formData) => api.post('/users/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadResume: (formData) => api.post('/users/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  saveJob: (jobId) => api.post(`/users/save-job/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/users/save-job/${jobId}`),
  getSavedJobs: () => api.get('/users/saved-jobs'),
  getMyApplications: () => api.get('/users/applications'),
  getRecommendedJobs: () => api.get('/users/recommended-jobs'),
  getPublicProfile: (userId) => api.get(`/users/public/${userId}`)
};

// Job APIs
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  fetchJobs: () => api.post('/jobs/fetch'),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/recruiter/my-jobs'),
  getJobApplicants: (jobId) => api.get(`/jobs/recruiter/${jobId}/applicants`),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getRecentJobs: () => api.get('/jobs/recent'),
  getRecommendedJobs: () => api.get('/jobs/user/recommended')
};

// Application APIs
export const applicationAPI = {
  applyForJob: (jobId, data) => api.post(`/applications/job/${jobId}`, data),
  getMyApplications: () => api.get('/applications/my'),
  getApplicationStatus: (jobId) => api.get(`/applications/job/${jobId}/status`),
  getJobApplicants: (jobId) => api.get(`/applications/job/${jobId}/applicants`),
  updateApplicationStatus: (applicationId, data) => api.put(`/applications/${applicationId}/status`, data),
  scheduleInterview: (applicationId, data) => api.post(`/applications/${applicationId}/interview`, data),
  withdrawApplication: (applicationId) => api.delete(`/applications/${applicationId}`),
  getAllApplications: () => api.get('/applications/recruiter/all')
};

// Admin APIs
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllJobs: (params) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
  rejectJob: (id) => api.put(`/admin/jobs/${id}/reject`),
  toggleFeaturedJob: (id) => api.put(`/admin/jobs/${id}/featured`),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getAnalytics: () => api.get('/admin/analytics')
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count')
};

export default api;

