import { create } from 'zustand';
import type { Ride } from '../types';

interface RideState {
  rides: Ride[];
  pendingRides: Ride[];
  ridesLoaded: boolean;
  setRides: (rides: Ride[]) => void;
  addRide: (ride: Ride) => void;
  updateRide: (rideId: string, updates: Partial<Ride>) => void;
  removeRide: (rideId: string) => void;
  setRidesLoaded: (loaded: boolean) => void;
}

export const useRideStore = create<RideState>((set) => ({
  rides: [],
  pendingRides: [],
  ridesLoaded: false,
  setRides: (rides) =>
    set({
      rides,
      pendingRides: rides.filter((r) => r.status === 'pending'),
      ridesLoaded: true,
    }),
  addRide: (ride) =>
    set((state) => {
      const rides = [ride, ...state.rides];
      return {
        rides,
        pendingRides: rides.filter((r) => r.status === 'pending'),
      };
    }),
  updateRide: (rideId, updates) =>
    set((state) => {
      const rides = state.rides.map((r) =>
        r.id === rideId ? { ...r, ...updates } : r,
      );
      return {
        rides,
        pendingRides: rides.filter((r) => r.status === 'pending'),
      };
    }),
  removeRide: (rideId) =>
    set((state) => {
      const rides = state.rides.filter((r) => r.id !== rideId);
      return {
        rides,
        pendingRides: rides.filter((r) => r.status === 'pending'),
      };
    }),
  setRidesLoaded: (loaded) => set({ ridesLoaded: loaded }),
}));
