import { useEffect } from 'react';
import { useRideStore } from '../store/useRideStore';
import { useDriverStore } from '../store/useDriverStore';
import type { Ride } from '../types';
import { MOCK_DRIVERS } from '../mocks/data';

// Simulates a new incoming ride request every 45 seconds
function simulateNewRide(): Ride {
  const passengers = [
    { id: 'p-sim-1', name: 'Zainab Musa', phone: '08077123456' },
    { id: 'p-sim-2', name: 'Chidi Okafor', phone: '08033987654' },
    { id: 'p-sim-3', name: 'Aisha Bello', phone: '08021456789' },
  ];
  const routes = [
    {
      pickup: { lat: 9.0591, lng: 7.4807, address: 'Wuse Zone 2, Abuja' },
      destination: { lat: 9.0895, lng: 7.4837, address: 'Maitama, Abuja' },
      fare: 1600,
    },
    {
      pickup: { lat: 9.0920, lng: 7.4100, address: 'Jabi, Abuja' },
      destination: { lat: 9.0472, lng: 7.4744, address: 'Garki, Abuja' },
      fare: 2200,
    },
    {
      pickup: { lat: 9.0264, lng: 7.5022, address: 'Asokoro, Abuja' },
      destination: { lat: 9.0778, lng: 7.4493, address: 'Utako, Abuja' },
      fare: 1900,
    },
  ];
  const passenger = passengers[Math.floor(Math.random() * passengers.length)];
  const route = routes[Math.floor(Math.random() * routes.length)];
  return {
    id: `r-sim-${Date.now()}`,
    passenger,
    ...route,
    currency: 'NGN',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function useWebSocket() {
  useEffect(() => {
    // Simulate a driver location drift every 5 seconds
    const locationInterval = setInterval(() => {
      const store = useDriverStore.getState();
      store.drivers.forEach((driver) => {
        if (driver.status === 'offline') return;
        useDriverStore.getState().updateLocation({
          driverId: driver.id,
          lat: driver.location.lat + (Math.random() - 0.5) * 0.002,
          lng: driver.location.lng + (Math.random() - 0.5) * 0.002,
        });
      });
    }, 5000);

    // Simulate a new incoming ride every 45 seconds
    const rideInterval = setInterval(() => {
      useRideStore.getState().addRide(simulateNewRide());
    }, 45000);

    // Simulate a driver going online/offline occasionally
    const statusInterval = setInterval(() => {
      const offlineDriver = { ...MOCK_DRIVERS[6], status: 'online' as const };
      useDriverStore.getState().addDriver(offlineDriver);
    }, 60000);

    return () => {
      clearInterval(locationInterval);
      clearInterval(rideInterval);
      clearInterval(statusInterval);
    };
  }, []);
}
