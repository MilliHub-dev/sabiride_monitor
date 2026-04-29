import client from './client';
import type { Admin } from '../types';

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export const login = (email: string, password: string) =>
  client.post<LoginResponse>('/auth/admin/login', { email, password });

export const logout = () => client.post('/auth/logout');

export const getMe = () => client.get<Admin>('/auth/me');
