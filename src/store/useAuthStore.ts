import { create } from 'zustand';
import type { Admin } from '../types';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: localStorage.getItem('sabi_admin_token'),
  refreshToken: localStorage.getItem('sabi_admin_refresh_token'),
  isAuthenticated: !!localStorage.getItem('sabi_admin_token'),
  setAuth: (admin, token, refreshToken) => {
    localStorage.setItem('sabi_admin_token', token);
    if (refreshToken) {
      localStorage.setItem('sabi_admin_refresh_token', refreshToken);
    }
    set({ admin, token, refreshToken: refreshToken || null, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('sabi_admin_token');
    localStorage.removeItem('sabi_admin_refresh_token');
    set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
  },
  updateToken: (token) => {
    localStorage.setItem('sabi_admin_token', token);
    set({ token });
  },
}));
