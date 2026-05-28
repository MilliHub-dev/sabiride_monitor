import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://tmp.sabirideweb.com.ng',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sabi_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    // Don't redirect on auth/login endpoints — wrong credentials return 401 there
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/') ||
      error.config?.url?.includes('/login/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('sabi_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
