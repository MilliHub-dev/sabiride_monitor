import { MOCK_STREAMS } from '../mocks/data';
import client from './client';
import type { Stream } from '../types';

/**
 * Livestream access for the ops team.
 *
 * Both calls previously used invented paths (`/streams/active`,
 * `/streams/{channel}/token`). The token exchange has a real counterpart under
 * /api/v1/; listing active streams does not exist on the backend at all.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mock = <T>(data: T) => Promise.resolve({ data });

/**
 * Currently-broadcasting rides.
 *
 * There is no backend endpoint for this yet - nothing tracks which rides are
 * live. Returns an empty list rather than calling a path that does not exist,
 * so the Streams page shows "0 active" instead of an error.
 */
export const getActiveStreams = () => {
  if (USE_MOCK) return mock<Stream[]>(MOCK_STREAMS);
  return mock<Stream[]>([]);
};

/**
 * An Agora token for watching a ride's stream.
 *
 * Takes a ride id, not a channel name: the server derives the channel from the
 * ride (`ride_<id>`) and issues the token for it.
 *
 * Note this will currently return 403 for ops staff. `user_can_join_ride_call`
 * admits only the ride's own driver or its passengers, with no staff bypass, so
 * watching requires a backend permission change first.
 */
export const getStreamToken = (rideId: string) => {
  if (USE_MOCK) return mock<{ token: string }>({ token: 'mock-agora-token' });
  return client.post<{ token: string; channel: string; uid: number }>(
    '/api/v1/agora/token/',
    { ride_id: rideId },
  );
};
