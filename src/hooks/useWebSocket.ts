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
const HEARTBEAT_INTERVAL = 25000;
const DRIVER_REFRESH_INTERVAL = 30000;
const MONITOR_PATH = '/ride/monitor';

// Module-level ref so non-hook code (e.g. API functions) can send actions
let _send: ((data: object) => void) | null = null;

/** Send any action to the monitor WebSocket from outside a React component */
export function sendWsAction(action: string, params?: Record<string, unknown>) {
  if (_send) {
    _send({ action, ...params });
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
      const token = localStorage.getItem('sabi_admin_token');
      if (!token) return;

      const url = `${import.meta.env.VITE_WS_URL}${MONITOR_PATH}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      _send = (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      };

      ws.onopen = () => {
        startHeartbeat(ws);
        startDriverRefresh(ws);
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

      };

      ws.onclose = () => {
        stopHeartbeat();
        stopDriverRefresh();
        _send = null;
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
      break;

    case 'pending_refreshed':
      sendWsAction('list_passengers');
      break;

    case 'pong':
      break;

    case 'error':
      console.warn('[monitor ws] server error:', (msg as { type: string; message: string }).message);
      break;
  }
}
