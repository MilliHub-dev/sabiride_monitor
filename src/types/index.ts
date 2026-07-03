// ─── Internal app types ────────────────────────────────────────────────────

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
  state?: string;
  status: 'online' | 'busy' | 'offline';
  location: Location;
  distanceKm?: number;
  vehicleType: 'car' | 'bike' | 'van';
  rating: number;
  avatarInitials: string;
  plateNumber?: string;
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
  serviceType?: 'standard' | 'shared' | 'dispatch' | 'luxury';
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

// ─── WebSocket wire types (server → client) ───────────────────────────────

export interface WsDriverRaw {
  driver_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  driver_type: 1 | 2;        // 1 = Driver, 2 = Dispatch Rider
  rating: string;
  current_location: { lat: number; lng: number };
  plate_number: string;
}

export interface WsPassengerRaw {
  passenger_id: string;
  journey: {
    pickup: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    service_type: 'standard' | 'shared' | 'dispatch' | 'luxury';
    option: 'instant' | 'schedule';
    estimated_price: { amount: number; currency: string };
  };
  state: 'searching';
}

export interface WsPassengerRequest {
  type: 'passenger_request';
  passenger_id: string;
  pickup: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  service_type: 'standard' | 'shared' | 'dispatch' | 'luxury';
  option: 'instant' | 'schedule';
  estimated_price: { amount: number; currency: string };
  bargain_amount: { amount: number; currency: string } | null;
  timestamp: string;
}

export interface WsRideUpdateLocation {
  type: 'ride_update';
  ride_id: string;
  update_type: 'location';
  location: { lat: number; lng: number };
  timestamp: string;
}

export interface WsRideUpdateStatus {
  type: 'ride_update';
  ride_id: string;
  update_type: 'status';
  status: 'MATCHED' | 'ACTIVE' | 'COMPLETED' | 'CANCEL';
  progress?: string;
  message?: string;
  timestamp: string;
}

export interface WsDriversList {
  type: 'drivers_list';
  drivers: WsDriverRaw[];
}

export interface WsPassengersList {
  type: 'passengers_list';
  passengers: WsPassengerRaw[];
}

export interface WsManualMatchSuccess {
  type: 'manual_match_success';
  passenger_id: string;
  driver_id: string;
  ride_data: Record<string, unknown>;
}

export interface WsManualMatchSent {
  type: 'manual_match_sent';
  passenger_id: string;
  driver_id: string;
}

export interface WsError {
  type: 'error';
  message: string;
}

export type WsMessage =
  | WsPassengerRequest
  | WsRideUpdateLocation
  | WsRideUpdateStatus
  | WsDriversList
  | WsPassengersList
  | WsManualMatchSuccess
  | WsManualMatchSent
  | WsError
  | { type: 'connected' }
  | { type: 'pong'; timestamp?: string }
  | { type: 'pending_refreshed'; count?: number };

// ─── Mapping helpers ──────────────────────────────────────────────────────

export function wsDriverToDriver(raw: WsDriverRaw): Driver {
  const name = `${raw.first_name} ${raw.last_name}`.trim();
  return {
    id: raw.driver_id,
    name,
    phone: raw.phone_number,
    status: 'online',
    vehicleType: raw.driver_type === 2 ? 'bike' : 'car',
    rating: parseFloat(raw.rating) || 0,
    location: raw.current_location,
    plateNumber: raw.plate_number,
    avatarInitials:
      (raw.first_name[0] ?? '') + (raw.last_name[0] ?? ''),
  };
}

export function wsPassengerRequestToRide(msg: WsPassengerRequest): Ride {
  const shortId = msg.passenger_id.slice(-5).toUpperCase();
  return {
    id: msg.passenger_id,
    passenger: {
      id: msg.passenger_id,
      name: `Passenger #${shortId}`,
      phone: '',
    },
    pickup: { lat: msg.pickup.lat, lng: msg.pickup.lng },
    destination: { lat: msg.destination.lat, lng: msg.destination.lng },
    fare: msg.estimated_price.amount,
    currency: 'NGN',
    status: 'pending',
    serviceType: msg.service_type,
    createdAt: msg.timestamp,
  };
}

export function wsPassengerRawToRide(p: WsPassengerRaw): Ride {
  const shortId = p.passenger_id.slice(-5).toUpperCase();
  return {
    id: p.passenger_id,
    passenger: {
      id: p.passenger_id,
      name: `Passenger #${shortId}`,
      phone: '',
    },
    pickup: { lat: p.journey.pickup.lat, lng: p.journey.pickup.lng },
    destination: { lat: p.journey.destination.lat, lng: p.journey.destination.lng },
    fare: p.journey.estimated_price.amount,
    currency: 'NGN',
    status: 'pending',
    serviceType: p.journey.service_type,
    createdAt: new Date().toISOString(),
  };
}

export function wsStatusToInternal(
  status: 'MATCHED' | 'ACTIVE' | 'COMPLETED' | 'CANCEL',
): Ride['status'] {
  switch (status) {
    case 'MATCHED':   return 'accepted';
    case 'ACTIVE':    return 'active';
    case 'COMPLETED': return 'completed';
    case 'CANCEL':    return 'cancelled';
  }
}
