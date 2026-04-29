import type { Driver, Ride, Stream, LiveStats } from '../types';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1', name: 'Abdullahi Oladele', phone: '08031234567', state: 'FCT',
    status: 'online', vehicleType: 'car', rating: 4.8, avatarInitials: 'AO',
    location: { lat: 9.0591, lng: 7.4807 },
  },
  {
    id: 'd2', name: 'Kingsley Madu', phone: '08051234567', state: 'FCT',
    status: 'online', vehicleType: 'car', rating: 4.6, avatarInitials: 'KM',
    location: { lat: 9.0895, lng: 7.4837 },
  },
  {
    id: 'd3', name: 'Musa Abubakar', phone: '07031234567', state: 'FCT',
    status: 'busy', vehicleType: 'bike', rating: 4.5, avatarInitials: 'MA',
    location: { lat: 9.0472, lng: 7.4744 },
  },
  {
    id: 'd4', name: 'Ngozi Anyanwu', phone: '08091234567', state: 'FCT',
    status: 'online', vehicleType: 'car', rating: 4.9, avatarInitials: 'NA',
    location: { lat: 9.0778, lng: 7.4493 },
  },
  {
    id: 'd5', name: 'Emeka Okonkwo', phone: '08121234567', state: 'FCT',
    status: 'online', vehicleType: 'van', rating: 4.3, avatarInitials: 'EO',
    location: { lat: 9.1247, lng: 7.4211 },
  },
  {
    id: 'd6', name: 'Halima Suleiman', phone: '08071234567', state: 'FCT',
    status: 'busy', vehicleType: 'car', rating: 4.7, avatarInitials: 'HS',
    location: { lat: 9.0264, lng: 7.5022 },
  },
  {
    id: 'd7', name: 'Tunde Adeyemi', phone: '08141234567', state: 'FCT',
    status: 'online', vehicleType: 'car', rating: 4.4, avatarInitials: 'TA',
    location: { lat: 9.0650, lng: 7.3800 },
  },
  {
    id: 'd8', name: 'Fatima Ibrahim', phone: '08161234567', state: 'FCT',
    status: 'online', vehicleType: 'car', rating: 4.6, avatarInitials: 'FI',
    location: { lat: 9.0920, lng: 7.4100 },
  },
];

export const MOCK_RIDES: Ride[] = [
  {
    id: 'r0041', passenger: { id: 'p1', name: 'Amaka Osei', phone: '08011111111' },
    pickup: { lat: 9.0591, lng: 7.4807, address: 'Wuse Zone 2, Abuja' },
    destination: { lat: 9.0778, lng: 7.4493, address: 'Utako, Abuja' },
    fare: 1400, currency: 'NGN', status: 'pending',
    createdAt: new Date(Date.now() - 65000).toISOString(),
  },
  {
    id: 'r0040', passenger: { id: 'p2', name: 'Chukwuemeka Balogun', phone: '08022222222' },
    pickup: { lat: 9.0472, lng: 7.4744, address: 'Garki Area 11, Abuja' },
    destination: { lat: 9.0895, lng: 7.4837, address: 'Maitama, Abuja' },
    fare: 2100, currency: 'NGN', status: 'pending',
    createdAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'r0039', passenger: { id: 'p3', name: 'Ngozi Adaeze', phone: '08033333333' },
    pickup: { lat: 9.0579, lng: 7.4839, address: 'Central Business District, Abuja' },
    destination: { lat: 9.1247, lng: 7.4211, address: 'Gwarinpa, Abuja' },
    fare: 3800, currency: 'NGN', status: 'active',
    driver: MOCK_DRIVERS[2],
    createdAt: new Date(Date.now() - 300000).toISOString(),
    acceptedAt: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'r0038', passenger: { id: 'p4', name: 'Grace Yakubu', phone: '08044444444' },
    pickup: { lat: 9.0264, lng: 7.5022, address: 'Asokoro, Abuja' },
    destination: { lat: 8.9879, lng: 7.4119, address: 'Lugbe, Abuja' },
    fare: 4500, currency: 'NGN', status: 'completed',
    driver: MOCK_DRIVERS[5],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    acceptedAt: new Date(Date.now() - 7100000).toISOString(),
    completedAt: new Date(Date.now() - 6800000).toISOString(),
  },
  {
    id: 'r0037', passenger: { id: 'p5', name: 'Bashir Umar', phone: '08055555555' },
    pickup: { lat: 9.0650, lng: 7.3800, address: 'Kubwa, Abuja' },
    destination: { lat: 9.0579, lng: 7.4839, address: 'Area 1, Abuja' },
    fare: 2800, currency: 'NGN', status: 'cancelled',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'r0036', passenger: { id: 'p6', name: 'Adaeze Nwosu', phone: '08066666666' },
    pickup: { lat: 9.0920, lng: 7.4100, address: 'Jabi, Abuja' },
    destination: { lat: 9.0472, lng: 7.4744, address: 'Garki, Abuja' },
    fare: 1800, currency: 'NGN', status: 'active',
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
