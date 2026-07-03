import { MOCK_RIDES } from '../mocks/data';
import { sendWsAction } from '../hooks/useWebSocket';
import client from './client';
import type { Ride } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

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
  if (USE_MOCK) {
    let list = [...MOCK_RIDES];
    if (params?.status && params.status !== 'all') {
      const s = params.status;
      list = list.filter((r) =>
        s === 'active'
          ? r.status === 'active' || r.status === 'accepted'
          : r.status === s,
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
    return mock<RidesResponse>({
      data: list,
      total: list.length,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
  }
  return client.get<RidesResponse>('/rides', { params });
};

export const getPendingRides = () => {
  if (USE_MOCK) return mock<Ride[]>(MOCK_RIDES.filter((r) => r.status === 'pending'));
  return client.get<Ride[]>('/rides/pending');
};

export const getLiveRides = () => {
  if (USE_MOCK) return mock<Ride[]>(MOCK_RIDES.filter((r) => r.status === 'pending' || r.status === 'active'));
  return client.get<Ride[]>('/rides/live');
};

export const getRide = (id: string) => {
  if (USE_MOCK) return mock<Ride>(MOCK_RIDES.find((r) => r.id === id) ?? MOCK_RIDES[0]);
  return client.get<Ride>(`/rides/${id}`);
};

/**
 * Manually assign a driver to a passenger request.
 * Sends a `manual_match` action over the monitor WebSocket.
 * Falls back to a resolved mock when WS is not connected (dev/mock mode).
 */
export const assignDriver = (
  passengerId: string,
  driverId: string,
  proposedFare?: number,
): Promise<{ data: { success: boolean } }> => {
  sendWsAction('manual_match', {
    passenger_id: passengerId,
    driver_id: driverId,
    ...(proposedFare !== undefined && { proposed_fare: proposedFare }),
  });
  // Resolve immediately; real confirmation arrives via `manual_match_success` WS event
  return Promise.resolve({ data: { success: true } });
};
