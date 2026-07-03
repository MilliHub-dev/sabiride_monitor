import { MOCK_DRIVERS } from '../mocks/data';
import client from './client';
import type { Driver } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getDrivers = () => {
  if (USE_MOCK) return mock<Driver[]>(MOCK_DRIVERS);
  return client.get<Driver[]>('/drivers');
};

export const getOnlineDrivers = () => {
  if (USE_MOCK) return mock<Driver[]>(MOCK_DRIVERS.filter((d) => d.status !== 'offline'));
  return client.get<Driver[]>('/drivers/online');
};

export const getDriver = (id: string) => {
  if (USE_MOCK) return mock<Driver>(MOCK_DRIVERS.find((d) => d.id === id) ?? MOCK_DRIVERS[0]);
  return client.get<Driver>(`/drivers/${id}`);
};
