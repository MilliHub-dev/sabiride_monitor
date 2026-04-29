# Sabi Ride — Admin Operations Monitor
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** April 2026  
**Product:** Sabi Ride Admin Monitor (Internal Web App)  
**Website:** [sabiride.net](https://www.sabiride.net)  
**Backend Base URL:** `https://tmp.sabirideweb.com.ng`  
**Live Streaming SDK:** Agora.io  
**Stack:** React (Frontend only — backend already built)

---

## 1. Overview

### 1.1 Problem Statement

Sabi Ride recently launched and driver density is still growing. When a passenger places a ride request, there is a real risk it goes unaccepted because no nearby driver is online. This creates a poor first impression for new passengers.

To counter this, the ops team needs a real-time internal tool that lets them monitor incoming ride requests, identify available drivers, and manually dispatch them — acting as a human-powered dispatch center until the driver base grows.

### 1.2 Product Goal

Build a **React web app for internal admin use only** that gives the Sabi Ride operations team:

- A live map showing all online drivers and incoming ride requests in real time
- The ability to manually assign an unaccepted ride to an online driver
- A view of all active live streams from the Agora-powered in-app streaming feature
- A searchable, filterable ride management table
- Secure admin-only login

### 1.3 Why This Matters

> "We just launched and we don't want our passengers to feel like we are not active."

This tool is a **low-cost operational safety net** for the launch period. It bridges the gap between passenger demand and driver supply while Sabi Ride grows its driver base organically.

---

## 2. Brand & Design System

Pull design tokens directly from the Sabi Ride website (`sabiride.net`) for visual consistency.

### 2.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2DBF6E` | Primary green — CTAs, active states, driver pins |
| `--color-primary-dark` | `#1A9452` | Hover states, pressed buttons |
| `--color-primary-light` | `rgba(45,191,110,0.12)` | Background tints, badges |
| `--color-bg` | `#0A0F1A` | App background (dark) |
| `--color-surface` | `#111827` | Cards, nav bar |
| `--color-surface-2` | `#1A2332` | Nested cards, table rows |
| `--color-border` | `rgba(255,255,255,0.08)` | All borders |
| `--color-text-primary` | `#F0F4FF` | Headings, primary text |
| `--color-text-secondary` | `#94A3B8` | Labels, subtext |
| `--color-text-muted` | `#4B5563` | Placeholders, disabled |
| `--color-danger` | `#EF4444` | Pending rides, unaccepted alerts |
| `--color-warning` | `#F59E0B` | Busy drivers, in-progress rides |
| `--color-info` | `#3B82F6` | Info states, stream overlays |
| `--color-live` | `#EF4444` | LIVE badge on streams |

### 2.2 Typography

```css
/* Primary font — matches sabiride.net body/UI */
font-family: 'Space Grotesk', sans-serif;

/* Monospace — ride IDs, timestamps, stats */
font-family: 'JetBrains Mono', monospace;

/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

| Role | Size | Weight | Font |
|---|---|---|---|
| Page heading | 22px | 700 | Space Grotesk |
| Section heading | 16px | 600 | Space Grotesk |
| Body / labels | 14px | 400 | Space Grotesk |
| Small / meta | 12px | 400 | Space Grotesk |
| IDs / timestamps | 12px | 400 | JetBrains Mono |
| Stat numbers | 24px | 600 | JetBrains Mono |

### 2.3 Component Tokens

```css
--border-radius-sm: 6px;
--border-radius-md: 10px;
--border-radius-lg: 14px;
--border-radius-pill: 999px;
--transition: 0.18s ease;
--shadow-card: 0 1px 3px rgba(0,0,0,0.4);
```

---

## 3. Technical Architecture

### 3.1 Frontend Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| State management | Zustand |
| Map | Google Maps JS API  |
| Real-time updates | WebSocket (via backend) or polling fallback |
| Live streaming | Agora Web SDK (`agora-rtc-sdk-ng`) |
| Styling | Tailwind CSS v3 + custom CSS variables |
| HTTP client | Axios |
| Auth | JWT stored in httpOnly cookie |
| Component library | shadcn/ui (optional, for table + modal) |

### 3.2 Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance with base URL + auth header
│   ├── rides.ts           # Ride endpoints
│   ├── drivers.ts         # Driver endpoints
│   ├── streams.ts         # Stream endpoints
│   └── auth.ts            # Login / logout
├── components/
│   ├── map/
│   │   ├── LiveMap.tsx        # Main Google Maps component
│   │   ├── DriverPin.tsx      # Marker for online driver
│   │   ├── RidePin.tsx        # Pulsing marker for new ride request
│   │   └── RidePopupCard.tsx  # Popup card overlay on new ride
│   ├── drivers/
│   │   ├── DriverSidebar.tsx  # Scrollable driver list
│   │   └── DriverRow.tsx      # Single driver row item
│   ├── rides/
│   │   ├── RidesTable.tsx     # Full ride management table
│   │   ├── RideRow.tsx        # Single ride row
│   │   └── AssignModal.tsx    # Modal to select + assign a driver
│   ├── streams/
│   │   ├── StreamGrid.tsx     # Grid of all live streams
│   │   ├── StreamCard.tsx     # Single stream thumbnail card
│   │   └── StreamViewer.tsx   # Agora full-screen stream viewer
│   ├── layout/
│   │   ├── AppShell.tsx       # Outer layout with sidebar nav
│   │   ├── TopNav.tsx         # Top stats bar
│   │   └── ProtectedRoute.tsx # Auth guard HOC
│   └── ui/
│       ├── StatusBadge.tsx    # Reusable status pill
│       ├── SearchBar.tsx      # Reusable search input
│       └── StatCard.tsx       # Live stats number cards
├── pages/
│   ├── Login.tsx
│   ├── Home.tsx              # Map + driver sidebar
│   ├── Rides.tsx             # Ride management table
│   └── Streams.tsx           # Live stream grid
├── store/
│   ├── useAuthStore.ts
│   ├── useRideStore.ts
│   ├── useDriverStore.ts
│   └── useStreamStore.ts
├── hooks/
│   ├── useWebSocket.ts       # WS connection + message dispatch
│   ├── useAgoraStream.ts     # Agora RTC join/leave/watch logic
│   └── useRideAlert.ts       # Sound/notification on new ride
├── types/
│   └── index.ts              # Ride, Driver, Stream, User types
└── utils/
    ├── distance.ts           # Haversine distance helpers
    └── format.ts             # Currency, time, status formatters
```

### 3.3 Axios Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://tmp.sabirideweb.com.ng',
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sabi_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
```

### 3.4 Environment Variables

```env
# .env
VITE_API_BASE_URL=https://tmp.sabirideweb.com.ng
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_AGORA_APP_ID=your_agora_app_id
VITE_WS_URL=wss://tmp.sabirideweb.com.ng/ws
```

---

## 4. API Reference

All endpoints are prefixed with `https://tmp.sabirideweb.com.ng`.

### 4.1 Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/admin/login` | Admin login — returns JWT |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current admin profile |

**Login request body:**
```json
{
  "email": "ops@sabiride.net",
  "password": "string"
}
```

**Login response:**
```json
{
  "token": "eyJ...",
  "admin": {
    "id": "uuid",
    "name": "string",
    "email": "string"
  }
}
```

### 4.2 Drivers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/drivers` | All drivers with optional filters |
| GET | `/drivers/online` | Currently online drivers with location |
| GET | `/drivers/:id` | Single driver profile |

**Query params for `GET /drivers`:**
- `status` — `online`, `busy`, `offline`
- `state` — e.g. `FCT`, `Lagos`
- `lat`, `lng` — sort by distance from coordinates

**Driver object:**
```typescript
interface Driver {
  id: string;
  name: string;
  phone: string;
  state: string;
  status: 'online' | 'busy' | 'offline';
  location: { lat: number; lng: number };
  distanceKm?: number; // populated when lat/lng filter used
  vehicleType: 'car' | 'bike' | 'van';
  rating: number;
}
```

### 4.3 Rides

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rides` | All rides, paginated |
| GET | `/rides/pending` | Unaccepted rides only |
| GET | `/rides/:id` | Single ride details |
| POST | `/rides/:id/assign` | Manually assign a driver |
| GET | `/rides/live` | All active/pending rides (polling) |

**Query params for `GET /rides`:**
- `status` — `pending`, `active`, `completed`, `cancelled`
- `page`, `limit`
- `search` — search by passenger name or location

**POST `/rides/:id/assign` body:**
```json
{
  "driver_id": "uuid"
}
```

**Ride object:**
```typescript
interface Ride {
  id: string;
  passenger: {
    id: string;
    name: string;
    phone: string;
  };
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  fare: number;
  currency: 'NGN';
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
  driver?: Driver;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}
```

### 4.4 Live Streams

| Method | Endpoint | Description |
|---|---|---|
| GET | `/streams/active` | All currently active streams |
| GET | `/streams/:channelName/token` | Get Agora RTC token to join as viewer |

**Stream object:**
```typescript
interface Stream {
  id: string;
  channelName: string;   // Agora channel name
  driver: Driver;
  viewerCount: number;
  startedAt: string;
  location?: { lat: number; lng: number };
  locationLabel?: string;
}
```

### 4.5 Stats

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats/live` | Live summary counts for the stats bar |

**Stats response:**
```json
{
  "onlineDrivers": 7,
  "pendingRides": 2,
  "activeRides": 3,
  "completedToday": 12,
  "activeStreams": 4
}
```

### 4.6 WebSocket Events

Connect to: `wss://tmp.sabirideweb.com.ng/ws`

Include auth header on connection: `Authorization: Bearer <token>`

| Event (inbound) | Payload | Description |
|---|---|---|
| `ride.new` | `Ride` object | New ride request created |
| `ride.accepted` | `{ rideId, driver }` | Ride accepted by driver |
| `ride.assigned` | `{ rideId, driver }` | Ride manually assigned by admin |
| `ride.completed` | `{ rideId }` | Ride completed |
| `ride.cancelled` | `{ rideId }` | Ride cancelled |
| `driver.online` | `Driver` object | Driver came online |
| `driver.offline` | `{ driverId }` | Driver went offline |
| `driver.location` | `{ driverId, lat, lng }` | Driver moved (location update) |
| `stream.started` | `Stream` object | New live stream started |
| `stream.ended` | `{ channelName }` | Stream ended |

```typescript
// src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { useRideStore } from '../store/useRideStore';
import { useDriverStore } from '../store/useDriverStore';

export function useWebSocket() {
  useEffect(() => {
    const token = localStorage.getItem('sabi_admin_token');
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);

    ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      switch (type) {
        case 'ride.new':
          useRideStore.getState().addRide(payload);
          break;
        case 'driver.online':
          useDriverStore.getState().addDriver(payload);
          break;
        case 'driver.location':
          useDriverStore.getState().updateLocation(payload);
          break;
        // ... handle all events
      }
    };

    return () => ws.close();
  }, []);
}
```

---

## 5. Screens

### 5.1 Login Screen (`/login`)

**Purpose:** Authenticate admin before accessing any internal screen.

**Components:**
- Sabi Ride logo (centred)
- Email input
- Password input
- "Sign in to dashboard" button (primary green)
- Error message on failed login
- "Internal access only — not for public use" note

**Behaviour:**
- On success → store JWT → redirect to `/`
- All other routes redirect to `/login` if not authenticated (`ProtectedRoute`)
- No "forgot password" or "sign up" links (internal tool)

---

### 5.2 Home Screen — Live Dispatch Map (`/`)

**Purpose:** Primary operational screen. Real-time view of drivers and ride requests.

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  SEARCH BAR          [State filter] [Nearest] [Online]  │
├────────────────┬────────────────────────────────────────┤
│ Stats bar: Online Drivers | Pending | Active | Today    │
├────────────────────────────────────────┬────────────────┤
│                                        │  DRIVER        │
│          LIVE MAP                      │  SIDEBAR       │
│                                        │  (scrollable)  │
│  ● driver pins (green=online,          │                │
│    amber=busy)                         │  AO Abdullahi  │
│  ⚡ ride request pins (red, pulsing)   │  FCT · 0.8km   │
│                                        │                │
│  ┌─────────────────┐                   │  KM Kingsley   │
│  │ ⚡ New ride!     │ (popup on         │  FCT · 1.2km   │
│  │ Passenger: ...  │  new WS event)    │                │
│  │ Pickup: ...     │                   │  ...           │
│  │ Fare: ₦1,400    │                   │                │
│  │ [Assign driver] │                   │                │
│  └─────────────────┘                   │                │
└────────────────────────────────────────┴────────────────┘
```

#### Map Component

- Use `@react-google-maps/api` or `mapbox-gl`
- Centre map on Abuja, Nigeria (`lat: 9.0765, lng: 7.3986`) on first load
- Auto-pan to new ride request location when a `ride.new` WS event fires
- Driver pin colours:
  - Green `#2DBF6E` → `status: 'online'`
  - Amber `#F59E0B` → `status: 'busy'`
- Ride request pins: red pulsing circle animation, always on top layer

#### Ride Request Popup Card

Triggered by `ride.new` WebSocket event. Floats over the map (top-right corner):

```
┌────────────────────────────────┐
│ ⚡ NEW RIDE REQUEST             │ ← red pulsing dot
│ Passenger: Amaka Osei           │
│ From: Wuse Zone 2               │
│ To:   Utako                     │
│ Est:  ₦1,400 · 4.2km            │
│ Unaccepted: 0:42s               │ ← live countdown timer
│ [Assign driver →]               │ ← opens AssignModal
└────────────────────────────────┘
```

- Timer counts up in seconds until ride is accepted or assigned
- If ride is accepted by a driver, card auto-dismisses
- Multiple pending rides stack as cards (max 3 visible, scrollable)

#### Driver Sidebar

- Sorted by distance from **nearest pending ride** pickup location
- Filter chips: `All`, `Online`, `By state`
- Each row: avatar initials, name, state, distance, status dot
- Clicking a driver row highlights their pin on the map

#### Search Bar

- Text input: search driver by name
- Dropdown: filter by Nigerian state
- Toggle: "Online only" — hides offline drivers from map and sidebar

---

### 5.3 Rides Screen — Management Table (`/rides`)

**Purpose:** Full list of all rides. Admin can assign unaccepted rides to specific online drivers.

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Search rides...]          [Pending ●2] [Active] [All] [Completed]  │
├──────────┬───────────┬────────────┬─────────────┬───────┬────┬──────┤
│ Ride ID  │ Passenger │ Pickup     │ Destination │ Fare  │ St.│ Act. │
├──────────┼───────────┼────────────┼─────────────┼───────┼────┼──────┤
│ #R0041   │ Amaka O.  │ Wuse Zn 2  │ Utako       │ ₦1,400│🔴  │Assign│
│ #R0040   │ Chukwu B. │ Garki 11   │ Maitama     │ ₦2,100│🔴  │Assign│
│ #R0039   │ Ngozi A.  │ Central    │ Gwarinpa    │ ₦3,800│🟡  │Track │
│ #R0037   │ Grace Y.  │ Asokoro    │ Lugbe       │ ₦4,500│🟢  │  —   │
└──────────┴───────────┴────────────┴─────────────┴───────┴────┴──────┘
```

#### Status Badges

| Status | Colour | Label |
|---|---|---|
| `pending` | Red `#EF4444` | Pending |
| `accepted` / `active` | Amber `#F59E0B` | Active |
| `completed` | Green `#2DBF6E` | Done |
| `cancelled` | Grey `#4B5563` | Cancelled |

#### Assign Modal

Triggered by clicking "Assign →" on a pending ride row:

```
┌─────────────────────────────────────────┐
│  Assign driver to ride #R0041           │
│  Passenger: Amaka Osei                  │
│  Pickup: Wuse Zone 2 → Utako            │
│                                         │
│  Select a driver                        │
│  ┌─────────────────────────────────┐    │
│  │ ● Abdullahi Oladele (0.8km)     │    │
│  │ ● Kingsley Madu     (1.2km)     │    │
│  │ ● Musa Abubakar     (2.1km)     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Cancel]         [Confirm Assign →]    │
└─────────────────────────────────────────┘
```

- Only shows `online` drivers in the list
- Drivers sorted by distance from pickup location
- On confirm → `POST /rides/:id/assign` → toast notification → update table row

---

### 5.4 Streams Screen — Live Stream Viewer (`/streams`)

**Purpose:** Admin view of all active in-app live streams powered by Agora.io.

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  Live streams · 4 active                    ● LIVE  │
├─────────────────────────┬───────────────────────────┤
│  [Stream thumbnail]     │  [Stream thumbnail]       │
│  ● LIVE    👁 12        │  ● LIVE    👁 5           │
│  ▶ (play icon)          │  ▶ (play icon)            │
│  Abdullahi O.           │  Kingsley M.              │
│  Wuse, FCT              │  Garki, FCT               │
├─────────────────────────┼───────────────────────────┤
│  [Stream thumbnail]     │  [Stream thumbnail]       │
│  ...                    │  ...                      │
└─────────────────────────┴───────────────────────────┘
```

#### Agora Integration

```typescript
// src/hooks/useAgoraStream.ts
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

export async function joinStreamAsViewer(channelName: string, agoraToken: string) {
  const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

  // Admin joins as audience only — never as host
  await client.setClientRole('audience');

  await client.join(
    import.meta.env.VITE_AGORA_APP_ID,
    channelName,
    agoraToken,
    null  // let Agora assign UID
  );

  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === 'video') {
      user.videoTrack?.play('stream-player'); // DOM element ID
    }
    if (mediaType === 'audio') {
      user.audioTrack?.play();
    }
  });

  return client; // caller stores ref for cleanup
}
```

**Stream viewer modal** (full-screen overlay when clicking a stream card):
- Video player fills screen
- Driver name + location badge overlay (bottom-left)
- Viewer count badge (top-right)
- Close (×) button — calls `client.leave()` on close
- Mute/unmute audio control

**Stream token flow:**
1. Frontend calls `GET /streams/:channelName/token`
2. Backend returns a short-lived Agora RTC token
3. Frontend calls `joinStreamAsViewer(channelName, token)`

---

## 6. Real-time Architecture

```
                   ┌─────────────────────────────────┐
                   │   Sabi Ride Backend              │
                   │   (tmp.sabirideweb.com.ng)       │
                   │                                  │
                   │  REST API   +   WebSocket Server │
                   └─────────┬───────────────────┬───┘
                             │                   │
                    HTTP/REST │                   │ WSS events
                             ↓                   ↓
                   ┌───────────────────────────────────┐
                   │      React Admin App              │
                   │                                   │
                   │  Zustand stores:                  │
                   │    useRideStore  ← ride.new       │
                   │    useDriverStore ← driver.online │
                   │    useStreamStore ← stream.started│
                   │                                   │
                   │  Map re-renders on store updates  │
                   │  Table re-renders on store updates│
                   └───────────────────────────────────┘

                         Agora.io (separate)
                   ┌─────────────────────────────┐
                   │  Agora RTC stream channel    │
                   │  Admin joins as audience     │
                   │  Token fetched from backend  │
                   └─────────────────────────────┘
```

---

## 7. Build Phases

### Phase 1 — Foundation (Week 1)

- Vite + React + TypeScript project scaffold
- React Router v6 setup with `ProtectedRoute`
- Login page + JWT auth flow connected to `POST /auth/admin/login`
- App shell layout: sidebar nav (Home, Rides, Streams), top stats bar
- Axios client configured with `https://tmp.sabirideweb.com.ng`
- Zustand stores scaffolded (empty)

**Deliverable:** Can log in and see the empty shell.

### Phase 2 — Live Map (Week 2)

- Google Maps (or Mapbox) integration
- `GET /drivers/online` → render driver pins on map
- WebSocket connection (`useWebSocket` hook)
- Handle `driver.online`, `driver.offline`, `driver.location` events
- Handle `ride.new` event → add pin + popup card
- Driver sidebar with distance sort
- Search + filter bar

**Deliverable:** Can see online drivers and incoming ride requests live on map.

### Phase 3 — Rides + Assignment (Week 3)

- `GET /rides` → full rides table with status filters
- `POST /rides/:id/assign` → assign modal with online driver list
- Real-time table updates from WebSocket events
- Sound alert (`useRideAlert`) on new pending ride
- Toast notifications on assign success/failure

**Deliverable:** Admin can assign pending rides from the table.

### Phase 4 — Streams + Polish (Week 4)

- `GET /streams/active` → stream grid
- Agora SDK integration (`useAgoraStream`)
- Stream viewer modal (full-screen, token-gated)
- Viewer count display
- UI polish: animations, loading skeletons, error states
- Mobile-responsive adjustments for tablet use

**Deliverable:** Full app working end-to-end.

---

## 8. Key Types Reference

```typescript
// src/types/index.ts

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
  unacceptedSeconds?: number; // live countdown on pending rides
}

export interface Stream {
  id: string;
  channelName: string;
  driver: Driver;
  viewerCount: number;
  startedAt: string;
  location?: Location;
}

export interface LiveStats {
  onlineDrivers: number;
  pendingRides: number;
  activeRides: number;
  completedToday: number;
  activeStreams: number;
}
```

---

## 9. Notifications & Alerts

| Event | Alert behaviour |
|---|---|
| New pending ride arrives | Play alert sound + popup card on map |
| Ride unaccepted for >2 minutes | Popup card border turns red, timer flashes |
| Driver goes offline while ride pending | Toast warning: "Driver [name] went offline" |
| Assign succeeds | Green toast: "Ride #XXXX assigned to [driver name]" |
| Assign fails | Red toast: "Assignment failed — try again" |
| New stream starts | Stream grid updates silently |

---

## 10. Non-functional Requirements

| Requirement | Target |
|---|---|
| Map pin update latency | < 2s from WS event |
| Ride popup display time | < 1s from WS event |
| Auth token expiry handling | Auto-redirect to `/login` on 401 |
| Browser support | Chrome 90+, Edge 90+, Firefox 88+ (desktop only) |
| Screen size | Optimised for 1280px+ desktop/laptop screens |
| Access control | All routes behind login — no public access |

---

## 11. Out of Scope (v1)

- Push notifications (in-app alerts only)
- Driver-to-admin messaging
- Passenger management
- Analytics or reporting dashboards
- Mobile app version of the admin tool
- Multi-admin roles or permission levels

---

*Sabi Ride Admin Monitor PRD v1.0 — Internal document only*  
*Do not share publicly.*