import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('cb_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export default api;
