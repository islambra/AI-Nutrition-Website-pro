import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle token expiration + global error logging)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Unknown error';

    if (!error.response) {
      console.error(`[API Network Error] ${url}: ${message}`);
    } else if (status !== 401) {
      console.error(`[API Error ${status}] ${url}: ${message}`);
    }

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;