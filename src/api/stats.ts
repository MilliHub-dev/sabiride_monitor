import { MOCK_STATS } from '../mocks/data';
import client from './client';
import type { LiveStats } from '../types';

/**
 * Platform-wide counters.
 *
 * Previously called `/stats/live`, which does not exist. The real aggregate
 * endpoint is /api/v1/analytics/get_analytics/ — shape differs from LiveStats,
 * so callers should map it rather than assume the old contract.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getLiveStats = () => {
  if (USE_MOCK) return mock<LiveStats>(MOCK_STATS);
  return client.get('/api/v1/analytics/get_analytics/');
};
