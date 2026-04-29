import { create } from 'zustand';
import type { Admin } from '../types';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: localStorage.getItem('sabi_admin_token'),
  isAuthenticated: !!localStorage.getItem('sabi_admin_token'),
  setAuth: (admin, token) => {
    localStorage.setItem('sabi_admin_token', token);
    set({ admin, token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('sabi_admin_token');
    set({ admin: null, token: null, isAuthenticated: false });
  },
}));
