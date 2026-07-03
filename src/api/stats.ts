import { MOCK_STATS } from '../mocks/data';
import client from './client';
import type { LiveStats } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getLiveStats = () => {
  if (USE_MOCK) return mock<LiveStats>(MOCK_STATS);
  return client.get<LiveStats>('/stats/live');
};
