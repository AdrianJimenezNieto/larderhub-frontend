import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // leemos del localStorage directamente para evitar dependencia circular con authStore
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      // usamos window.location porque estamos fuera del árbol de componentes
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
