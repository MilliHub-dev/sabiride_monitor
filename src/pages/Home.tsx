import { useEffect, useState } from 'react';
import { useDriverStore } from '../store/useDriverStore';
import { useRideStore } from '../store/useRideStore';
import LiveMap from '../components/map/LiveMap';
import RidePopupCard from '../components/map/RidePopupCard';
import DriverSidebar from '../components/drivers/DriverSidebar';
import AssignModal from '../components/rides/AssignModal';
import type { Ride } from '../types';

const NIGERIAN_STATES = [
  'FCT', 'Lagos', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Enugu',
  'Delta', 'Anambra', 'Ogun', 'Ondo', 'Borno', 'Sokoto', 'Akwa ibom',
];

export default function Home() {

  const drivers = useDriverStore((s) => s.drivers);
  const selectedDriverId = useDriverStore((s) => s.selectedDriverId);
  const setSelectedDriver = useDriverStore((s) => s.setSelectedDriver);
  const driversLoaded = useDriverStore((s) => s.driversLoaded);

  const pendingRides = useRideStore((s) => s.pendingRides);
  const updateRide = useRideStore((s) => s.updateRide);
  const ridesLoaded = useRideStore((s) => s.ridesLoaded);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [panTarget, setPanTarget] = useState<google.maps.LatLngLiteral | null>(null);
  const [assigningRide, setAssigningRide] = useState<Ride | null>(null);
  const [dismissedRideIds, setDismissedRideIds] = useState<Set<string>>(new Set());


  // Auto-pan to new ride requests
  useEffect(() => {
    if (pendingRides.length > 0) {
      const latest = pendingRides[0];
      setPanTarget({ lat: latest.pickup.lat, lng: latest.pickup.lng });
    }
  }, [pendingRides.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredDrivers = selectedState
    ? drivers.filter((d) => d.state === selectedState)
    : drivers;

  const visiblePopupRides = pendingRides.filter((r) => !dismissedRideIds.has(r.id));

  // Show loading state if data hasn't loaded yet
  if (!driversLoaded || !ridesLoaded) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔄</div>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Loading live data...
          </div>
        </div>
      </div>
    );
  }

  const handleDismiss = (rideId: string) =>
    setDismissedRideIds((prev) => new Set([...prev, rideId]));

  const handleAssigned = () => {
    if (assigningRide) {
      updateRide(assigningRide.id, { status: 'accepted' });
      setDismissedRideIds((prev) => new Set([...prev, assigningRide.id]));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search + filter bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          placeholder="Search driver by name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 280,
            padding: '7px 12px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            color: 'var(--color-text-primary)',
            fontSize: 13,
            fontFamily: 'Space Grotesk, sans-serif',
            outline: 'none',
          }}
        />
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{
            padding: '7px 10px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            color: selectedState ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontSize: 13,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(e) => setOnlineOnly(e.target.checked)}
            style={{ accentColor: 'var(--color-primary)', width: 14, height: 14 }}
          />
          Online only
        </label>

        {pendingRides.length > 0 && (
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--border-radius-pill)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-danger)', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-danger)' }}>
              {pendingRides.length} pending
            </span>
          </div>
        )}
      </div>

      {/* Map + sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <LiveMap
            drivers={filteredDrivers}
            pendingRides={pendingRides}
            selectedDriverId={selectedDriverId}
            onDriverClick={(id) => setSelectedDriver(id === selectedDriverId ? null : id)}
            onRideClick={(ride) => setAssigningRide(ride)}
            panTarget={panTarget}
          />

          {/* Ride popup cards */}
          <RidePopupCard
            rides={visiblePopupRides}
            onAssign={(ride) => setAssigningRide(ride)}
            onDismiss={handleDismiss}
          />
        </div>

        {/* Driver sidebar */}
        <DriverSidebar
          drivers={filteredDrivers}
          pendingRides={pendingRides}
          selectedDriverId={selectedDriverId}
          onDriverClick={(id) => {
            setSelectedDriver(id === selectedDriverId ? null : id);
            const driver = filteredDrivers.find((d) => d.id === id);
            if (driver) setPanTarget({ lat: driver.location.lat, lng: driver.location.lng });
          }}
          searchQuery={searchQuery}
          onlineOnly={onlineOnly}
        />
      </div>

      {/* Assign modal */}
      {assigningRide && (
        <AssignModal
          ride={assigningRide}
          onClose={() => setAssigningRide(null)}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}
