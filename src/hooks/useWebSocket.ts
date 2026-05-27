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
  WsManualMatchSuccess,
} from '../types';
import {
  wsDriverToDriver,
  wsPassengerRequestToRide,
  wsPassengerRawToRide,
  wsStatusToInternal,
} from '../types';

const RECONNECT_DELAY = 4000;
const HEARTBEAT_INTERVAL = 25000; // send ping every 25 s to stay alive
const MONITOR_PATH = '/ride/monitor';

// Module-level ref so non-hook code (e.g. API functions) can send actions
let _send: ((data: object) => void) | null = null;

/** Send any action to the monitor WebSocket from outside a React component */
export function sendWsAction(action: string, params?: Record<string, unknown>) {
  if (_send) {
    _send({ action, ...params });
  }
}

function useFallbackMock() {
  useEffect(() => {
    // Location drift every 5 s
    const locationInterval = setInterval(() => {
      useDriverStore.getState().drivers.forEach((d) => {
        useDriverStore.getState().updateLocation({
          driverId: d.id,
          lat: d.location.lat + (Math.random() - 0.5) * 0.002,
          lng: d.location.lng + (Math.random() - 0.5) * 0.002,
        });
      });
    }, 5000);

    // Simulated new ride request every 45 s
    const rideInterval = setInterval(() => {
      const routes = [
        { pickup: { lat: 9.0591, lng: 7.4807 }, destination: { lat: 9.0895, lng: 7.4837 }, fare: 1600 },
        { pickup: { lat: 9.0920, lng: 7.4100 }, destination: { lat: 9.0472, lng: 7.4744 }, fare: 2200 },
        { pickup: { lat: 9.0264, lng: 7.5022 }, destination: { lat: 9.0778, lng: 7.4493 }, fare: 1900 },
      ];
      const r = routes[Math.floor(Math.random() * routes.length)];
      const id = `mock-${Date.now()}`;
      useRideStore.getState().addRide({
        id,
        passenger: { id, name: `Passenger #${id.slice(-5).toUpperCase()}`, phone: '' },
        pickup: r.pickup,
        destination: r.destination,
        fare: r.fare,
        currency: 'NGN',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }, 45000);

    return () => {
      clearInterval(locationInterval);
      clearInterval(rideInterval);
    };
  }, []);
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const useMock = useRef(false);

  useFallbackMock();

  useEffect(() => {
    function stopHeartbeat() {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
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

    function connect() {
      const token = localStorage.getItem('sabi_admin_token');
      if (!token) return;

      const url = `${import.meta.env.VITE_WS_URL}${MONITOR_PATH}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      // Expose send function globally
      _send = (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      };

      ws.onopen = () => {
        useMock.current = false;
        startHeartbeat(ws);
        // Request initial data
        ws.send(JSON.stringify({ action: 'list_drivers' }));
        ws.send(JSON.stringify({ action: 'list_passengers' }));
      };

      ws.onmessage = (event) => {
        let msg: WsMessage;
        try {
          msg = JSON.parse(event.data) as WsMessage;
        } catch {
          return;
        }
        handleMessage(msg);
      };

      ws.onerror = () => {
        // On error fall back to mock; will still reconnect
        useMock.current = true;
      };

      ws.onclose = () => {
        stopHeartbeat();
        _send = null;
        useMock.current = true;
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
      };
    }

    connect();

    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      stopHeartbeat();
      _send = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

function handleMessage(msg: WsMessage) {
  switch (msg.type) {
    case 'connected':
      break;

    case 'drivers_list': {
      const { drivers } = msg as WsDriversList;
      useDriverStore.getState().setDrivers(drivers.map(wsDriverToDriver));
      break;
    }

    case 'passengers_list': {
      const { passengers } = msg as WsPassengersList;
      useRideStore.getState().setRides(passengers.map(wsPassengerRawToRide));
      break;
    }

    case 'passenger_request': {
      const req = msg as WsPassengerRequest;
      useRideStore.getState().addRide(wsPassengerRequestToRide(req));
      break;
    }

    case 'ride_update': {
      if ((msg as WsRideUpdateLocation | WsRideUpdateStatus).update_type === 'location') {
        const m = msg as WsRideUpdateLocation;
        useDriverStore.getState().updateLocation({
          driverId: m.ride_id,
          lat: m.location.lat,
          lng: m.location.lng,
        });
      } else {
        const m = msg as WsRideUpdateStatus;
        useRideStore.getState().updateRide(m.ride_id, {
          status: wsStatusToInternal(m.status),
        });
      }
      break;
    }

    case 'manual_match_success': {
      const m = msg as WsManualMatchSuccess;
      useRideStore.getState().updateRide(m.passenger_id, { status: 'accepted' });
      break;
    }

    case 'manual_match_sent':
      // Driver has been notified; ride stays pending until driver accepts
      break;

    case 'pending_refreshed':
      // Re-request full passenger list after a resync
      sendWsAction('list_passengers');
      break;

    case 'pong':
      break;

    case 'error':
      console.warn('[monitor ws] server error:', (msg as { type: string; message: string }).message);
      break;
  }
}
