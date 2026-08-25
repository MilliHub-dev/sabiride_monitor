import { useEffect, useRef } from 'react';
import { useRideStore } from '../store/useRideStore';
import { useDriverStore } from '../store/useDriverStore';
import type {
  WsMessage,
  WsDriversList,
  WsPassengersList,
  WsPassengerRequest,
  WsRideUpdateLocation,
  WsRideUpdateStatus,
  WsManualMatchSent,
} from '../types';
import {
  wsDriverToDriver,
  wsPassengerRequestToRide,
  wsPassengerRawToRide,
  wsStatusToInternal,
} from '../types';

// Close codes the monitoring consumer uses to refuse a connection outright.
const WS_CLOSE_UNAUTHENTICATED = 4001;
const WS_CLOSE_NOT_STAFF = 4003;

const RECONNECT_DELAY = 4000;
const HEARTBEAT_INTERVAL = 25000;
const DRIVER_REFRESH_INTERVAL = 30000;
const MONITOR_PATH = '/ride/monitor';

// Module-level ref so non-hook code (e.g. API functions) can send actions
let _send: ((data: object) => void) | null = null;
let _isConnected = false;
let _authFailed = false;

/** Send any action to the monitor WebSocket from outside a React component */
export function sendWsAction(action: string, params?: Record<string, unknown>) {
  if (_send && _isConnected) {
    _send({ action, ...params });
  } else {
    console.warn('[monitor ws] Cannot send action: WebSocket not connected');
  }
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const driverRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function stopHeartbeat() {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }

    function stopDriverRefresh() {
      if (driverRefreshRef.current) {
        clearInterval(driverRefreshRef.current);
        driverRefreshRef.current = null;
      }
    }

    function startHeartbeat(ws: WebSocket) {
      stopHeartbeat();
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'ping', timestamp: new Date().toISOString() }));
        }
      }, HEARTBEAT_INTERVAL);
    }

    function startDriverRefresh(ws: WebSocket) {
      stopDriverRefresh();
      driverRefreshRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'list_drivers' }));
        }
      }, DRIVER_REFRESH_INTERVAL);
    }

    function connect() {
      if (_authFailed) {
        console.log('[monitor ws] Skipping connection due to auth failure');
        return;
      }

      const token = localStorage.getItem('sabi_admin_token');
      if (!token) {
        console.warn('[monitor ws] No token found, skipping connection');
        return;
      }

      const url = `${import.meta.env.VITE_WS_URL}${MONITOR_PATH}?token=${encodeURIComponent(token)}`;
      console.log('[monitor ws] Connecting to:', url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      _send = (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      };

      ws.onopen = () => {
        console.log('[monitor ws] Connected successfully');
        _isConnected = true;
        startHeartbeat(ws);
        startDriverRefresh(ws);
        ws.send(JSON.stringify({ action: 'list_drivers' }));
        ws.send(JSON.stringify({ action: 'list_passengers' }));
      };

      ws.onmessage = (event) => {
        console.log('[monitor ws] Received message:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (!data || typeof data !== 'object') {
            console.warn('[monitor ws] Invalid message format:', event.data);
            return;
          }
          if (!data.type) {
            console.warn('[monitor ws] Message missing type field:', data);
            return;
          }
          handleMessage(data as WsMessage);
        } catch (err) {
          console.error('[monitor ws] Failed to parse message:', err, event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('[monitor ws] WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('[monitor ws] Connection closed:', event.code, event.reason);
        _isConnected = false;
        stopHeartbeat();
        stopDriverRefresh();
        _send = null;

        // 4001 (not authenticated) and 4003 (not staff) are deliberate
        // refusals - retrying cannot change the outcome. Reconnecting anyway
        // meant a non-staff account hammered the server every 4 seconds for as
        // long as the tab stayed open.
        if (
          event.code === WS_CLOSE_UNAUTHENTICATED ||
          event.code === WS_CLOSE_NOT_STAFF
        ) {
          console.error(
            '[monitor ws] Server refused the connection; not retrying.',
            event.code,
          );
          _authFailed = true;
          return;
        }

        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
      };
    }

    connect();

    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      stopHeartbeat();
      stopDriverRefresh();
      _send = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

function handleMessage(msg: WsMessage) {
  console.log('[monitor ws] Handling message type:', msg.type);
  switch (msg.type) {
    case 'connected':
      console.log('[monitor ws] Server confirmed connection');
      break;

    case 'drivers_list': {
      const { drivers } = msg as WsDriversList;
      console.log('[monitor ws] Received drivers_list with', drivers.length, 'drivers:', drivers);
      const mappedDrivers = drivers.map(wsDriverToDriver);
      console.log('[monitor ws] Mapped drivers:', mappedDrivers);
      useDriverStore.getState().setDrivers(mappedDrivers);
      break;
    }

    case 'passengers_list': {
      const { passengers } = msg as WsPassengersList;
      console.log('[monitor ws] Received passengers_list with', passengers.length, 'passengers');
      useRideStore.getState().setRides(passengers.map(wsPassengerRawToRide));
      break;
    }

    case 'passenger_request': {
      const req = msg as WsPassengerRequest;
      console.log('[monitor ws] New passenger request:', req.passenger_id);
      useRideStore.getState().addRide(wsPassengerRequestToRide(req));
      break;
    }

    case 'ride_update': {
      if ((msg as WsRideUpdateLocation | WsRideUpdateStatus).update_type === 'location') {
        const m = msg as WsRideUpdateLocation;
        // This used to pass `m.ride_id` as the driver id. The store matches on
        // driver id, so nothing ever matched and every live position was
        // dropped - pins only moved on the 30s list_drivers poll. The server
        // now names the mover explicitly.
        if (m.profile_type === 'driver' && m.profile_id) {
          console.log('[monitor ws] Driver location update:', m.profile_id);
          useDriverStore.getState().updateLocation({
            driverId: m.profile_id,
            lat: m.location.lat,
            lng: m.location.lng,
          });
        } else if (!m.profile_id) {
          // Older server build: it cannot say whose position this is, and
          // guessing would move the wrong pin. The periodic driver refresh
          // keeps the map roughly current in the meantime.
          console.warn(
            '[monitor ws] Location update without profile_id - ignoring',
            m.ride_id,
          );
        }
      } else {
        const m = msg as WsRideUpdateStatus;
        console.log('[monitor ws] Ride status update for:', m.ride_id, 'status:', m.status);
        useRideStore.getState().updateRide(m.ride_id, {
          status: wsStatusToInternal(m.status),
        });
      }
      break;
    }

    // The server sends `manual_match_sent`, never `manual_match_success`. The
    // row-updating branch was listening for the latter, so a ride the operator
    // had just dispatched sat on the board looking untouched.
    case 'manual_match_sent': {
      const m = msg as WsManualMatchSent;
      console.log('[monitor ws] Manual match sent:', m.passenger_id, '->', m.driver_id);
      if (m.passenger_id) {
        // 'accepted' here means "a driver has been dispatched to this request";
        // the driver has not confirmed yet. The board carries no finer status.
        useRideStore.getState().updateRide(m.passenger_id, { status: 'accepted' });
      }
      break;
    }

    case 'pending_refreshed':
      console.log('[monitor ws] Pending rides refreshed, requesting list_passengers');
      sendWsAction('list_passengers');
      break;

    case 'pong':
      console.log('[monitor ws] Pong received');
      break;

    case 'error':
      console.error('[monitor ws] Server error:', (msg as { type: string; message: string }).message);
      break;

    case 'response': {
      const response = msg as { type: 'response'; response_type: string; status: string; message: string; error_code?: string };
      // Both refusal codes end the session. 4003 ("staff privileges required")
      // was previously unhandled, so the operator saw nothing while the socket
      // retried forever behind a page that looked like it was working.
      if (
        response.response_type === 'error' &&
        (response.error_code === `CONNECTION_REJECTED_${WS_CLOSE_UNAUTHENTICATED}` ||
          response.error_code === `CONNECTION_REJECTED_${WS_CLOSE_NOT_STAFF}`)
      ) {
        console.error('[monitor ws] Connection rejected:', response.message);
        _authFailed = true;
        localStorage.removeItem('sabi_admin_token');
        localStorage.removeItem('sabi_admin_refresh_token');
        window.location.href = '/login';
      }
      break;
    }
  }
}
