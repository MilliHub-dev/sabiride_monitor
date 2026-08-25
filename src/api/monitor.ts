import client from './client';

/**
 * Staff-only listing endpoints behind the Drivers / Passengers / Rides /
 * Referrals screens.
 *
 * These replace the `/rides` and `/drivers` paths the app used to call, which
 * never existed on the backend. Everything here shares one envelope and one
 * filter vocabulary so a single filter component can drive all four screens.
 */

export interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
  /** Dropdown values computed server-side across the whole resource. */
  facets?: { states?: string[] };
}

/**
 * Query parameters as they go over the wire.
 *
 * Deliberately loose: the shared list hook builds these generically from its
 * filter state, and a precise per-endpoint shape cannot absorb that without
 * every call site casting. The recognised keys are documented per endpoint
 * below; unknown keys are ignored by the server.
 *
 * Common to all four: `search`, `state`, `date_from`, `date_to` (each either
 * `YYYY-MM-DD` or a full ISO timestamp), `page`, `page_size`.
 */
export type ListParams = Record<string, string | number | undefined>;

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  state: string | null;
  country: string | null;
  date_joined: string | null;
}

export interface MonitorDriver extends Person {
  driver_id: string;
  is_online: boolean;
  driver_type: number;
  rating_score: number | null;
}

export interface MonitorPassenger extends Person {
  passenger_id: string;
  is_online: boolean;
  created_at: string | null;
}

export interface MonitorRide {
  id: string;
  status: string;
  service_type: string;
  option: string;
  participant_count: number;
  created_at: string | null;
  passenger: Person | null;
  driver: Person | null;
}

export interface MonitorReferrer extends Person {
  referral_code: string;
  total_referrals: number;
  completed_signups: number;
  completed_first_rides: number;
  points_from_referrals: number;
}

/** Drop empty values so the query string carries only real filters. */
const clean = (filters: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all',
    ),
  );

/** Extra filters: `is_online` (true/false), `driver_type`. */
export const getMonitorDrivers = (filters: ListParams = {}) =>
  client.get<Paginated<MonitorDriver>>('/api/v1/monitor/drivers/', {
    params: clean(filters),
  });

/** Extra filters: `is_online` (true/false). */
export const getMonitorPassengers = (filters: ListParams = {}) =>
  client.get<Paginated<MonitorPassenger>>('/api/v1/monitor/passengers/', {
    params: clean(filters),
  });

/** Extra filters: `status`, `service_type`. */
export const getMonitorRides = (filters: ListParams = {}) =>
  client.get<Paginated<MonitorRide>>('/api/v1/monitor/rides/', {
    params: clean(filters),
  });

/** Extra filters: `min_referrals`. */
export const getMonitorReferrals = (filters: ListParams = {}) =>
  client.get<Paginated<MonitorReferrer>>('/api/v1/monitor/referrals/', {
    params: clean(filters),
  });
