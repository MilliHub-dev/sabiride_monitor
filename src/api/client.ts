import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://tmp.sabirideweb.com.ng';

const client = axios.create({
  baseURL: API_BASE_URL,
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
          // Two things were wrong here, and either alone broke the refresh -
          // so an expired session logged the operator straight out:
          //   - the path was `/users/refresh`; the route is
          //     `/users/token/refresh`, so this 404'd every time
          //   - the tokens come back nested under `data`, not at the root
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/users/token/refresh`,
            { refresh_token: refreshToken }
          );

          const payload = response.data?.data ?? response.data ?? {};
          const accessToken = payload.access_token;
          if (!accessToken) {
            throw new Error('Refresh response contained no access token');
          }

          localStorage.setItem('sabi_admin_token', accessToken);
          // The endpoint rotates the refresh token too; keeping the old one
          // would only fail at the next expiry.
          if (payload.refresh_token) {
            localStorage.setItem('sabi_admin_refresh_token', payload.refresh_token);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
