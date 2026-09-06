import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://mobilehub-backend-td7b.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // If request URL starts with /admin, use admin token; else use customer token
    const adminToken = localStorage.getItem('mobile_hub_admin_token');
    const customerToken = localStorage.getItem('mobile_hub_customer_token');

    if (config.url?.startsWith('/admin') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (config.url?.startsWith('/claims/admin') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors while preserving response metadata
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.message || 'An unexpected error occurred.');

    // Attach response and code to error object so components can inspect error.response / status / code
    const errObj = new Error(message) as any;
    errObj.response = error.response;
    errObj.status = error.response?.status;
    errObj.data = error.response?.data;
    errObj.code = error.response?.data?.code;
    return Promise.reject(errObj);
  }
);
