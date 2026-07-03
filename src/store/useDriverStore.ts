import { create } from 'zustand';
import type { Driver } from '../types';

interface DriverState {
  drivers: Driver[];
  selectedDriverId: string | null;
  driversLoaded: boolean;
  setDrivers: (drivers: Driver[]) => void;
  addDriver: (driver: Driver) => void;
  removeDriver: (driverId: string) => void;
  updateLocation: (payload: { driverId: string; lat: number; lng: number }) => void;
  setSelectedDriver: (driverId: string | null) => void;
  setDriversLoaded: (loaded: boolean) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  drivers: [],
  selectedDriverId: null,
  driversLoaded: false,
  setDrivers: (drivers) => set({ drivers, driversLoaded: true }),
  addDriver: (driver) =>
    set((state) => ({
      drivers: state.drivers.some((d) => d.id === driver.id)
        ? state.drivers.map((d) => (d.id === driver.id ? driver : d))
        : [...state.drivers, driver],
    })),
  removeDriver: (driverId) =>
    set((state) => ({
      drivers: state.drivers.filter((d) => d.id !== driverId),
    })),
  updateLocation: ({ driverId, lat, lng }) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === driverId ? { ...d, location: { ...d.location, lat, lng } } : d,
      ),
    })),
  setSelectedDriver: (driverId) => set({ selectedDriverId: driverId }),
  setDriversLoaded: (loaded) => set({ driversLoaded: loaded }),
}));
