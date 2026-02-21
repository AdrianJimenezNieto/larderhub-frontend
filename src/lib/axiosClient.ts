import axios from 'axios';

// Base URL read from env var; falls back to local Spring Boot default
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request interceptor: attach JWT token from Zustand store ---
apiClient.interceptors.request.use(
  (config) => {
    // Lazy import to avoid circular dependency between axiosClient ↔ authStore
    const token = JSON.parse(
      localStorage.getItem('auth-storage') ?? '{}'
    )?.state?.token as string | undefined;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: logout + redirect on 401 Unauthorized ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear persisted auth state from localStorage
      localStorage.removeItem('auth-storage');
      // Redirect to login without using React Router (outside component tree)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
