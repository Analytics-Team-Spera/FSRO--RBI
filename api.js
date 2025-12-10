import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
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
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  enable2FA: (password) => api.post('/api/auth/enable-2fa', { password }),
  verify2FA: (otp_code) => api.post('/api/auth/verify-2fa', { otp_code }),
  disable2FA: (password) => api.post('/api/auth/disable-2fa', { password }),
};

// Dashboard APIs
export const dashboardAPI = {
  getKPIs: (params) => api.get('/api/dashboard/kpis', { params }),
  getTrends: (params) => api.get('/api/dashboard/trends', { params }),
};

// Forecast APIs
export const forecastAPI = {
  getForecasts: (params) => api.get('/api/forecasts', { params }),
};

// Scenario APIs
export const scenarioAPI = {
  listScenarios: () => api.get('/api/scenarios/list'),
  simulate: (data) => api.post('/api/scenarios/simulate', data),
};

// Anomaly APIs
export const anomalyAPI = {
  getAnomalies: (params) => api.get('/api/anomalies', { params }),
  acknowledge: (id) => api.post(`/api/anomalies/${id}/acknowledge`),
};

// Report APIs
export const reportAPI = {
  export: (params) => api.get('/api/reports/export', { params, responseType: 'blob' }),
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (data) => api.put('/api/settings', data),
  testSlack: (webhook_url) => api.post('/api/settings/test-slack', { webhook_url }),
};

// Data APIs
export const dataAPI = {
  upload: (formData) => api.post('/api/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  seed: () => api.post('/api/data/seed'),
};

// ESG APIs
export const esgAPI = {
  getCompanies: (params) => api.get('/api/esg/companies', { params }),
  getSectors: () => api.get('/api/esg/sectors'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
