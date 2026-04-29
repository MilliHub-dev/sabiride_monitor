# Sabi Ride — Admin Operations Monitor

Internal React web app for the Sabi Ride ops team. Provides real-time visibility of drivers and ride requests, manual dispatch capability, and a live stream viewer — acting as a human-powered dispatch center during the early driver-growth phase.

> **Internal tool only. Not for public access.**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| State | Zustand |
| Map | Google Maps JS API (`@react-google-maps/api`) |
| Live streaming | Agora Web SDK (`agora-rtc-sdk-ng`) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| HTTP | Axios |
| Auth | JWT in localStorage |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_API_BASE_URL=https://tmp.sabirideweb.com.ng
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_AGORA_APP_ID=your_agora_app_id
VITE_WS_URL=wss://tmp.sabirideweb.com.ng/ws
```

### Run

```bash
npm run dev        # dev server → http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

---

## Login

Authentication is currently handled locally (no backend admin login endpoint yet).

| Field | Value |
|---|---|
| Email | `ops@sabiride.net` |
| Password | `sabiride2024` |

> To change credentials, edit the constants at the top of `src/pages/Login.tsx`.  
> When the backend admin login endpoint is ready, swap `handleSubmit` back to the API call in `src/api/auth.ts`.

---

## Mock Data

All API calls currently return mock data — the backend admin endpoints are not yet built. Mock data lives in `src/mocks/data.ts` and includes:

- **8 drivers** around Abuja (FCT) with realistic coordinates
- **6 rides** across all statuses (pending, active, completed, cancelled)
- **2 active streams**
- **Live stats** derived from the above

The WebSocket hook (`src/hooks/useWebSocket.ts`) simulates real-time events:

| Simulation | Interval |
|---|---|
| Driver location drift | Every 5 seconds |
| New incoming ride request | Every 45 seconds |

To switch to the real backend, replace the mock implementations in `src/api/` with real Axios calls. The rest of the app requires no changes.

---

## Screens

### `/login` — Login
Admin-only login screen. Redirects to `/` on success.

### `/` — Live Dispatch Map
Real-time map centered on Abuja showing:
- **Driver pins** — green (online) / amber (busy), move as location updates arrive
- **Ride request pins** — red pulsing markers for pending rides
- **Popup cards** — appear on new ride requests with a live countdown timer; flash red after 2 minutes unaccepted
- **Driver sidebar** — sorted by distance from the nearest pending pickup; filter by All / Online / Busy
- **Search + filter bar** — search drivers by name, filter by state, toggle online-only
- **Assign modal** — select an online driver sorted by proximity and confirm dispatch

### `/rides` — Rides Table
Paginated, searchable, filterable table of all rides with:
- Status filter tabs (All / Pending / Active / Completed / Cancelled)
- Live pending count badge
- Assign action on pending rows
- Toast notification on assign success or failure

### `/streams` — Live Streams
Grid of all active Agora.io live streams. Click any card to open a full-screen viewer:
- Admin joins as audience only (never as host)
- Driver name + location overlay
- Live viewer count
- Mute/unmute audio control
- Escape key or ✕ to close

---

## Project Structure

```
src/
├── api/              # Axios API functions (currently return mock data)
├── components/
│   ├── drivers/      # DriverSidebar, DriverRow
│   ├── layout/       # AppShell, TopNav, ProtectedRoute
│   ├── map/          # LiveMap, DriverPin, RidePin, RidePopupCard
│   ├── rides/        # RidesTable, RideRow, AssignModal
│   ├── streams/      # StreamGrid, StreamCard, StreamViewer
│   └── ui/           # StatusBadge, ToastContainer
├── hooks/
│   ├── useAgoraStream.ts   # Agora join / leave / watch
│   ├── useRideAlert.ts     # Web Audio alert tone on new ride
│   └── useWebSocket.ts     # WS connection (mock: simulates events)
├── mocks/
│   └── data.ts       # All dummy data — drivers, rides, streams, stats
├── pages/            # Login, Home, Rides, Streams
├── store/            # Zustand stores — auth, rides, drivers, streams, toasts
├── types/            # Shared TypeScript interfaces
└── utils/            # distance.ts (Haversine), format.ts (Naira, time)
```

---

## Connecting to the Real Backend

When the backend admin API is ready, update the following:

1. **Auth** — `src/pages/Login.tsx` → replace local check with `login()` call from `src/api/auth.ts`
2. **Auth guard** — `src/components/layout/ProtectedRoute.tsx` → already wired; just ensure `AUTH_REQUIRED = true`
3. **API modules** — restore Axios calls in `src/api/drivers.ts`, `rides.ts`, `streams.ts`, `stats.ts`
4. **WebSocket** — `src/hooks/useWebSocket.ts` → replace simulation with real WS connection to `VITE_WS_URL`

Expected backend base URL: `https://tmp.sabirideweb.com.ng`

---

## Design Tokens

Dark theme. All tokens are CSS custom properties in `src/index.css`.

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#2DBF6E` | Green — CTAs, online drivers, active states |
| `--color-bg` | `#0A0F1A` | App background |
| `--color-surface` | `#111827` | Cards, nav |
| `--color-danger` | `#EF4444` | Pending rides, alerts |
| `--color-warning` | `#F59E0B` | Busy drivers, active rides |

Fonts: **Space Grotesk** (UI) · **JetBrains Mono** (IDs, stats, timestamps)
