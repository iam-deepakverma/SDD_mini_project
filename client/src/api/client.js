import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sdd-mini-project.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('emedley_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('emedley_token')) {
        localStorage.removeItem('emedley_token');
        localStorage.removeItem('emedley_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
