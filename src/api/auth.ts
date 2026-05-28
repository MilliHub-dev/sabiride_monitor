import axios from 'axios';
import client from './client';
import type { Admin } from '../types';

interface StaffLoginResponse {
  access_token: string;
  refresh_token: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  new_staff: boolean;
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
    res = await client.post<StaffLoginResponse>(
      '/api/v1/users/login/staff',
      { email, password },
    );
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error('Could not reach the server. Check your connection.');
  }

  const { access_token, staff_id, first_name, last_name, email: userEmail } = res.data;

  return {
    data: {
      token: access_token,
      admin: {
        id: staff_id,
        email: userEmail,
        name: `${first_name} ${last_name}`.trim(),
      },
    },
  };
};

export const logout = () => Promise.resolve();

export const getMe = () => client.get<Admin>('/api/v1/users/me/sabi-rider');
