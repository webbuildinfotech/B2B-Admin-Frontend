// src/configs/axiosInstance.jsx
import axios from 'axios';
import { API_URL } from './env';
import logoutHandler from '../utils/logoutHandler';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: API_URL
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use dot notation to set Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type dynamically based on the request data
    if (config.data instanceof FormData) {
      // If the request data is FormData, set Content-Type to multipart/form-data
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      // Otherwise, set Content-Type to application/json
      config.headers['Content-Type'] = 'application/json';
    }

    return config; // Return the config directly
  },
  (error) => Promise.reject(error)
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
