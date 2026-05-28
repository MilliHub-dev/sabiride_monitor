import axios from 'axios';
import client from './client';
import type { Admin } from '../types';

// Server wraps all responses in this envelope
interface ApiEnvelope<T> {
  message: string;
  data: T;
  status: boolean;
  status_code: number;
}

interface StaffLoginData {
  access_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export const login = async (
  email: string,
  password: string,
): Promise<{ data: LoginResponse }> => {
  let res;
  try {
    res = await client.post<ApiEnvelope<StaffLoginData>>(
      '/api/v1/users/login/staff',
      { email, password },
    );
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error('Could not reach the server. Check your connection.');
  }

  if (!res.data.status) {
    throw new Error(res.data.message || 'Login failed');
  }

  const { access_token, user } = res.data.data;

  return {
    data: {
      token: access_token,
      admin: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
      },
    },
  };
};

export const logout = () => Promise.resolve();

export const getMe = () => client.get<Admin>('/api/v1/users/me/sabi-rider');
