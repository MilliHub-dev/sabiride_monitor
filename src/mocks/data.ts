import type { Driver, Ride, Stream, LiveStats } from '../types';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1', name: 'Abdullahi Oladele', phone: '+2348031234567',
    state: 'FCT', status: 'online', vehicleType: 'car', rating: 4.8,
    avatarInitials: 'AO', plateNumber: 'ABC-1234',
    location: { lat: 9.0591, lng: 7.4807 },
  },
  {
    id: 'd2', name: 'Kingsley Madu', phone: '+2348051234567',
    state: 'FCT', status: 'online', vehicleType: 'car', rating: 4.6,
    avatarInitials: 'KM', plateNumber: 'KJA-5678',
    location: { lat: 9.0895, lng: 7.4837 },
  },
  {
    id: 'd3', name: 'Musa Abubakar', phone: '+2347031234567',
    state: 'FCT', status: 'busy', vehicleType: 'bike', rating: 4.5,
    avatarInitials: 'MA', plateNumber: 'XYZ-9012',
    location: { lat: 9.0472, lng: 7.4744 },
  },
  {
    id: 'd4', name: 'Ngozi Anyanwu', phone: '+2348091234567',
    state: 'FCT', status: 'online', vehicleType: 'car', rating: 4.9,
    avatarInitials: 'NA', plateNumber: 'LND-3456',
    location: { lat: 9.0778, lng: 7.4493 },
  },
  {
    id: 'd5', name: 'Emeka Okonkwo', phone: '+2348121234567',
    state: 'FCT', status: 'online', vehicleType: 'van', rating: 4.3,
    avatarInitials: 'EO', plateNumber: 'ABJ-7890',
    location: { lat: 9.1247, lng: 7.4211 },
  },
  {
    id: 'd6', name: 'Halima Suleiman', phone: '+2348071234567',
    state: 'FCT', status: 'busy', vehicleType: 'car', rating: 4.7,
    avatarInitials: 'HS', plateNumber: 'FCT-2345',
    location: { lat: 9.0264, lng: 7.5022 },
  },
  {
    id: 'd7', name: 'Tunde Adeyemi', phone: '+2348141234567',
    state: 'FCT', status: 'online', vehicleType: 'car', rating: 4.4,
    avatarInitials: 'TA', plateNumber: 'LGS-6789',
    location: { lat: 9.0650, lng: 7.3800 },
  },
  {
    id: 'd8', name: 'Fatima Ibrahim', phone: '+2348161234567',
    state: 'FCT', status: 'online', vehicleType: 'car', rating: 4.6,
    avatarInitials: 'FI', plateNumber: 'KAN-0123',
    location: { lat: 9.0920, lng: 7.4100 },
  },
];

// Passenger requests mirror the shape of wsPassengerRequestToRide output
export const MOCK_RIDES: Ride[] = [
  {
    id: 'a1b2c',
    passenger: { id: 'a1b2c', name: 'Passenger #A1B2C', phone: '' },
    pickup: { lat: 9.0591, lng: 7.4807, address: 'Wuse Zone 2, Abuja' },
    destination: { lat: 9.0778, lng: 7.4493, address: 'Utako, Abuja' },
    fare: 1400, currency: 'NGN', status: 'pending',
    serviceType: 'standard',
    createdAt: new Date(Date.now() - 65000).toISOString(),
  },
  {
    id: 'f3e4d',
    passenger: { id: 'f3e4d', name: 'Passenger #F3E4D', phone: '' },
    pickup: { lat: 9.0472, lng: 7.4744, address: 'Garki Area 11, Abuja' },
    destination: { lat: 9.0895, lng: 7.4837, address: 'Maitama, Abuja' },
    fare: 2100, currency: 'NGN', status: 'pending',
    serviceType: 'standard',
    createdAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'c5d6e',
    passenger: { id: 'c5d6e', name: 'Passenger #C5D6E', phone: '' },
    pickup: { lat: 9.0579, lng: 7.4839, address: 'Central Business District, Abuja' },
    destination: { lat: 9.1247, lng: 7.4211, address: 'Gwarinpa, Abuja' },
    fare: 3800, currency: 'NGN', status: 'active',
    serviceType: 'standard',
    driver: MOCK_DRIVERS[2],
    createdAt: new Date(Date.now() - 300000).toISOString(),
    acceptedAt: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'b7a8f',
    passenger: { id: 'b7a8f', name: 'Passenger #B7A8F', phone: '' },
    pickup: { lat: 9.0264, lng: 7.5022, address: 'Asokoro, Abuja' },
    destination: { lat: 8.9879, lng: 7.4119, address: 'Lugbe, Abuja' },
    fare: 4500, currency: 'NGN', status: 'completed',
    serviceType: 'luxury',
    driver: MOCK_DRIVERS[5],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    acceptedAt: new Date(Date.now() - 7100000).toISOString(),
    completedAt: new Date(Date.now() - 6800000).toISOString(),
  },
  {
    id: 'e9f0a',
    passenger: { id: 'e9f0a', name: 'Passenger #E9F0A', phone: '' },
    pickup: { lat: 9.0650, lng: 7.3800, address: 'Kubwa, Abuja' },
    destination: { lat: 9.0579, lng: 7.4839, address: 'Area 1, Abuja' },
    fare: 2800, currency: 'NGN', status: 'cancelled',
    serviceType: 'shared',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'd2c3b',
    passenger: { id: 'd2c3b', name: 'Passenger #D2C3B', phone: '' },
    pickup: { lat: 9.0920, lng: 7.4100, address: 'Jabi, Abuja' },
    destination: { lat: 9.0472, lng: 7.4744, address: 'Garki, Abuja' },
    fare: 1800, currency: 'NGN', status: 'active',
    serviceType: 'standard',
    driver: MOCK_DRIVERS[1],
    createdAt: new Date(Date.now() - 600000).toISOString(),
    acceptedAt: new Date(Date.now() - 550000).toISOString(),
  },
];

export const MOCK_STREAMS: Stream[] = [
  {
    id: 's1', channelName: 'sabi-stream-d1',
    driver: MOCK_DRIVERS[0],
    viewerCount: 12,
    startedAt: new Date(Date.now() - 900000).toISOString(),
    locationLabel: 'Wuse, FCT',
    location: { lat: 9.0591, lng: 7.4807 },
  },
  {
    id: 's2', channelName: 'sabi-stream-d4',
    driver: MOCK_DRIVERS[3],
    viewerCount: 5,
    startedAt: new Date(Date.now() - 300000).toISOString(),
    locationLabel: 'Utako, FCT',
    location: { lat: 9.0778, lng: 7.4493 },
  },
];

export const MOCK_STATS: LiveStats = {
  onlineDrivers: MOCK_DRIVERS.filter((d) => d.status === 'online').length,
  pendingRides: MOCK_RIDES.filter((r) => r.status === 'pending').length,
  activeRides: MOCK_RIDES.filter((r) => r.status === 'active').length,
  completedToday: 8,
  activeStreams: MOCK_STREAMS.length,
};
