import { MOCK_STATS } from '../mocks/data';
import type { LiveStats } from '../types';

const mock = <T>(data: T) => Promise.resolve({ data });

export const getLiveStats = () => mock<LiveStats>(MOCK_STATS);
