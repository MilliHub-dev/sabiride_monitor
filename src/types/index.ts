export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  state: string;
  status: 'online' | 'busy' | 'offline';
  location: Location;
  distanceKm?: number;
  vehicleType: 'car' | 'bike' | 'van';
  rating: number;
  avatarInitials: string;
}

export interface Passenger {
  id: string;
  name: string;
  phone: string;
}

export interface Ride {
  id: string;
  passenger: Passenger;
  pickup: Location;
  destination: Location;
  fare: number;
  currency: 'NGN';
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
  driver?: Driver;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  unacceptedSeconds?: number;
}

export interface Stream {
  id: string;
  channelName: string;
  driver: Driver;
  viewerCount: number;
  startedAt: string;
  location?: Location;
  locationLabel?: string;
}

export interface LiveStats {
  onlineDrivers: number;
  pendingRides: number;
  activeRides: number;
  completedToday: number;
  activeStreams: number;
}
