import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('devfolio_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // // 👇 IMPORTANT FIX
  // if (!(config.data instanceof FormData)) {
  //   config.headers['Content-Type'] = 'application/json';
  // }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('devfolio_token');
      // Only redirect if not on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;