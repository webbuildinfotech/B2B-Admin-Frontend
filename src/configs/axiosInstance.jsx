// src/configs/axiosInstance.jsx
import axios from 'axios';
import { API_URL } from './env';
import logoutHandler from '../utils/logoutHandler';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: false, // Disable credentials to avoid CORS issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    console.log(`📤 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Admin API Request Error:', error);
    return Promise.reject(error);
  }
);

let isLoggingOut = false; // Global flag to prevent multiple logout processes

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true; // Set flag to prevent multiple processes
      
      let countdown = 5;
      const toastId = toast.error(`Session expired. Logging out in ${countdown} seconds.`);

      const interval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
          toast.error(`Session expired. Logging out in ${countdown} seconds.`, { id: toastId });
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        toast.dismiss(toastId);
        logoutHandler();
        isLoggingOut = false; // Reset flag after logout
      }, 5000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
