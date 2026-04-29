import { MOCK_RIDES } from '../mocks/data';
import type { Ride } from '../types';

const mock = <T>(data: T) => Promise.resolve({ data });

export interface RidesResponse {
  data: Ride[];
  total: number;
  page: number;
  limit: number;
}

export const getRides = (params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  let list = [...MOCK_RIDES];
  if (params?.status && params.status !== 'all') {
    const s = params.status;
    list = list.filter((r) =>
      s === 'active' ? r.status === 'active' || r.status === 'accepted' : r.status === s,
    );
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.passenger.name.toLowerCase().includes(q) ||
        r.pickup.address?.toLowerCase().includes(q) ||
        r.destination.address?.toLowerCase().includes(q),
    );
  }
  return mock<RidesResponse>({ data: list, total: list.length, page: params?.page ?? 1, limit: params?.limit ?? 20 });
};

export const getPendingRides = () =>
  mock<Ride[]>(MOCK_RIDES.filter((r) => r.status === 'pending'));

export const getLiveRides = () =>
  mock<Ride[]>(MOCK_RIDES.filter((r) => r.status === 'pending' || r.status === 'active'));

export const getRide = (id: string) =>
  mock<Ride>(MOCK_RIDES.find((r) => r.id === id) ?? MOCK_RIDES[0]);

export const assignDriver = (_rideId: string, _driverId: string) =>
  mock<{ success: boolean }>({ success: true });
