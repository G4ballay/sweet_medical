import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, value);
      }
    }
    return searchParams.toString();
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sweet-medical-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sweet-medical-token');
      localStorage.removeItem('sweet-medical-user');

      const isLoginRequest = error.config && error.config.url && error.config.url.endsWith('/sessions');
      const isAlreadyOnLanding = window.location.pathname === '/';

      if (!isLoginRequest && !isAlreadyOnLanding) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
