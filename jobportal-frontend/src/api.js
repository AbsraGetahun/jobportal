// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});


// Add interceptors for error handling and token management
api.interceptors.request.use((config) => {
    // Skip auth for registration and login endpoints
    const isPublicEndpoint = config.url.includes('register') || config.url.includes('login');
    if (!isPublicEndpoint) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (response.config.url.includes('/profile') && response.config.method === 'put') {
      console.log('Profile update API response intercepted:', response);
    }
    return response;
  },
  (error) => {
    console.error('🔍 API Interceptor Error:', {
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      error: error,
      message: error.message,
      code: error.code
    });

    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network error - no response received
      console.error('🌐 Network Error - No response received:', error.request);
      return Promise.reject({
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString()
      });
    } else {
      // Something else happened - programming error
      console.error('💥 Unexpected Error:', error);
      return Promise.reject({
        error: 'Application Error',
        message: error.message || 'An unexpected error occurred.',
        code: 'UNEXPECTED_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
);
export default {
  // Generic HTTP methods for backward compatibility
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),

  // Registration endpoints (public, no auth needed)
  createJobSeeker: (data) => {
    return api.post('/register', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  createEmployer: (data) => {
    return api.post('/register', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getFieldOfStudyOptions: () => {
    return api.get('/field-of-study');
  },
  // Login endpoints (public, no auth needed)
  loginJobSeeker: (data) => {
    return api.post('/login', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  loginEmployer: (data) => {
    return api.post('/login', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  loginAdmin: (data) => {
    return api.post('/login', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  
  // Email verification endpoints
  resendVerificationEmail: (data) => {
    return api.post('/email/resend', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  
  // Protected endpoints (require auth)
  getEmployers: () => api.get('/admin/employers'),
  getJobSeekers: () => api.get('/admin/jobseekers'),
  getApplications: () => api.get('/applications'),
  getJobApplications: (jobId) => api.get(`/jobs/${jobId}/applications`),
  postJob: (data) => api.post('/jobs', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/my-jobs'),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => {
    // Check if data is FormData (for file uploads) or regular object
    if (data instanceof FormData) {
      return api.put('/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      return api.put('/profile', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  },
  updatePassword: (data) => api.put('/profile/password', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  deleteProfile: () => api.delete('/profile'),
  updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  getJobs: (params) => api.get('/jobs', {
      params: {
          search: params?.search || '',
          location: params?.location || '',
          category: params?.category || '',
          job_type: params?.job_type || '',
          experience_level: params?.experience_level || '',
          per_page: params?.per_page || 12
      }
  }),
  verifyAuth: () => {
    // Create a new instance without the skip auth logic for login/register
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    const finalApiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

    const authApi = axios.create({
      baseURL: finalApiUrl,
    });
    
    // Add interceptor to always include auth token
    authApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      console.log('Token in verifyAuth interceptor:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', `Bearer ${token}`);
      } else {
        console.log('No token found in localStorage');
      }
      return config;
    });
    
    // Add response interceptor for debugging
    authApi.interceptors.response.use(
      (response) => {
        console.log('verifyAuth response:', response);
        return response;
      },
      (error) => {
        console.log('verifyAuth error:', error);
        return Promise.reject(error);
      }
    );
    
    return authApi.get('/user');
  },
  submitApplication: (data) => {
    return api.post('/applications', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
  },
  getJobDetails: (jobId) => api.get(`/jobs/${jobId}`),
  
  // Admin endpoints
  getAdminStats: () => api.get('/admin/stats'),
  getAIInsights: () => api.get('/admin/ai-insights'),
  getAdminProfile: () => api.get('/admin/profile'),
  getAdminJobSeekers: () => api.get('/admin/jobseekers'),
  getAdminEmployers: () => api.get('/admin/employers'),
  getAdminJobs: () => api.get('/admin/jobs'),
  getAdminJob: (id) => api.get(`/admin/jobs/${id}`),
  updateAdminJob: (id, data) => api.put(`/admin/jobs/${id}`, data),
  getAdminFeedback: () => api.get('/admin/feedback'),
  getAdminFeedbackById: (id) => api.get(`/admin/feedback/${id}`),
  updateAdminFeedback: (id, data) => api.put(`/admin/feedback/${id}`, data),

  // New Admin API endpoints
  getAdminApplications: () => api.get('/admin/applications'),
  getAdminApplication: (id) => api.get(`/admin/applications/${id}`),
  updateAdminApplication: (id, data) => api.put(`/admin/applications/${id}/status`, data),

  getAdminReports: (params) => api.get('/admin/reports', { params }),
  exportAdminReport: (params) => api.get('/admin/reports/export', { params }),
  getAdminAnalytics: () => api.get('/admin/analytics/overview'),

  getAdminFraudAlerts: () => api.get('/admin/fraud/alerts'),
  getAdminFraudAlert: (id) => api.get(`/admin/fraud/alerts/${id}`),
  investigateAdminFraudAlert: (id) => api.post(`/admin/fraud/report/${id}/investigate`, { status: 'investigating' }),
  resolveAdminFraudAlert: (id, data) => api.post(`/admin/fraud/report/${id}/resolve`, data),

  getAdminCMS: () => api.get('/admin/cms/pages'),
  getAdminCMSPages: () => api.get('/admin/cms/pages'),
  getAdminCMSCategories: () => api.get('/admin/cms/categories'),
  createAdminCMSPage: (data) => api.post('/admin/cms/pages', data),
  updateAdminCMSPage: (id, data) => api.put(`/admin/cms/pages/${id}`, data),
  deleteAdminCMSPage: (id) => api.delete(`/admin/cms/pages/${id}`),

  getAdminSupport: () => api.get('/admin/support/tickets'),
  getAdminSupportTickets: () => api.get('/admin/support/tickets'),
  getAdminSupportTicket: (id) => api.get(`/admin/support/tickets/${id}`),
  updateAdminSupportTicket: (id, data) => api.put(`/admin/support/tickets/${id}`, data),
  updateAdminSupportTicketStatus: (id, data) => api.put(`/admin/support/tickets/${id}/status`, data),
  sendBulkEmail: (data) => api.post('/admin/communication/bulk-email', data),
  sendSystemAnnouncement: (data) => api.post('/admin/communication/announcement', data),

  getAdminSettings: () => api.get('/admin/settings'),
  getAdminSetting: (id) => api.get(`/admin/settings/${id}`),
  updateAdminSetting: (id, data) => api.put(`/admin/settings/${id}`, data),
  bulkUpdateAdminSettings: (data) => api.put('/admin/settings', { settings: data }),
  
  // Notification endpoints
  getNotifications: () => api.get('/notifications'),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  
  // Recommendation endpoints
  getRecommendations: (params) => api.get('/recommendations', { params }),
  getProfileBasedRecommendations: (params) => api.get('/recommendations/profile', { params }),
  getHistoryBasedRecommendations: (params) => api.get('/recommendations/history', { params }),
  getTrendingJobs: (params) => api.get('/recommendations/trending', { params }),
  getSkillBasedRecommendations: (params) => api.get('/recommendations/skills', { params }),
  getCompanyPreferenceRecommendations: (params) => api.get('/recommendations/company-preference', { params }),

  // Saved Jobs endpoints
  saveJob: (jobId) => api.post(`/saved-jobs/${jobId}`, {}, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  unsaveJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),
  getSavedJobs: () => api.get('/saved-jobs'),
  checkSavedStatus: (jobId) => api.get(`/saved-jobs/${jobId}/check`),
};