import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://tmp.sabirideweb.com.ng',
});

let isRefreshing = false;

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sabi_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Don't redirect on auth/login endpoints — wrong credentials return 401 there
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/') ||
      originalRequest?.url?.includes('/login/');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('sabi_admin_refresh_token');

      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'https://tmp.sabirideweb.com.ng'}/api/v1/users/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token } = response.data;
          localStorage.setItem('sabi_admin_token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          isRefreshing = false;
          return client(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          localStorage.removeItem('sabi_admin_token');
          localStorage.removeItem('sabi_admin_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('sabi_admin_token');
      localStorage.removeItem('sabi_admin_refresh_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default client;
