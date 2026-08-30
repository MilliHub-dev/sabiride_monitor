import { MOCK_DRIVERS } from '../mocks/data';
import { getMonitorDrivers } from './monitor';
import client from './client';
import type { Driver } from '../types';

/**
 * Driver lookups, served by the admin REST API under /api/v1/.
 *
 * These previously called `/drivers` and `/drivers/online` — paths that never
 * existed on this backend, left over from the mock scaffolding. Everything now
 * goes through /api/v1/admin/drivers/, the same endpoint the Drivers screen
 * uses, so there is one source of truth rather than two half-real ones.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getDrivers = (params: Record<string, string | number> = {}) => {
  if (USE_MOCK) return mock<Driver[]>(MOCK_DRIVERS);
  return getMonitorDrivers(params);
};

export const getOnlineDrivers = (params: Record<string, string | number> = {}) => {
  if (USE_MOCK) {
    return mock<Driver[]>(MOCK_DRIVERS.filter((d) => d.status !== 'offline'));
  }
  return getMonitorDrivers({ ...params, is_online: 'true' });
};

/**
 * A single driver. The admin list has no detail route, so this searches for the
 * id and takes the first match — adequate for the one place it is used, and it
 * keeps every call on /api/v1/ rather than inventing another path.
 */
export const getDriver = (id: string) => {
  if (USE_MOCK) {
    return mock<Driver>(MOCK_DRIVERS.find((d) => d.id === id) ?? MOCK_DRIVERS[0]);
  }
  return client.get(`/api/v1/admin/drivers/`, { params: { search: id, page_size: 1 } });
};
