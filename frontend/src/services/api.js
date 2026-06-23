import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Injeta token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ssvetur_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login em caso de token expirado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('ssvetur_token')) {
      localStorage.removeItem('ssvetur_token');
      localStorage.removeItem('ssvetur_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
