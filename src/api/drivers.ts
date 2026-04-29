import { MOCK_DRIVERS } from '../mocks/data';
import type { Driver } from '../types';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getDrivers = () => mock<Driver[]>(MOCK_DRIVERS);

export const getOnlineDrivers = () =>
  mock<Driver[]>(MOCK_DRIVERS.filter((d) => d.status !== 'offline'));

export const getDriver = (id: string) =>
  mock<Driver>(MOCK_DRIVERS.find((d) => d.id === id) ?? MOCK_DRIVERS[0]);
