import { useMemo, useState } from 'react';
import type { Driver, Ride } from '../../types';
import { haversineKm } from '../../utils/distance';
import DriverRow from './DriverRow';

type FilterStatus = 'all' | 'online' | 'busy';

interface Props {
  drivers: Driver[];
  pendingRides: Ride[];
  selectedDriverId: string | null;
  onDriverClick: (driverId: string) => void;
  searchQuery: string;
  onlineOnly: boolean;
}

export default function DriverSidebar({
  drivers,
  pendingRides,
  selectedDriverId,
  onDriverClick,
  searchQuery,
  onlineOnly,
}: Props) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  // Reference point: nearest pending ride pickup, or Abuja center
  const refPoint = useMemo(() => {
    if (pendingRides.length > 0) return pendingRides[0].pickup;
    return { lat: 9.0765, lng: 7.3986 };
  }, [pendingRides]);

  const displayed = useMemo(() => {
    let list = drivers
      .filter((d) => d.status !== 'offline')
      .map((d) => ({
        ...d,
        distanceKm: haversineKm(refPoint.lat, refPoint.lng, d.location.lat, d.location.lng),
      }));

    if (onlineOnly || filter === 'online') list = list.filter((d) => d.status === 'online');
    if (filter === 'busy') list = list.filter((d) => d.status === 'busy');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [drivers, refPoint, filter, onlineOnly, searchQuery]);

  const chips: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Online', value: 'online' },
    { label: 'Busy', value: 'busy' },
  ];

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          DRIVERS · {displayed.length}
        </div>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 4 }}>
          {chips.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--border-radius-pill)',
                border: 'none',
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                background: filter === value ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: filter === value ? '#fff' : 'var(--color-text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {displayed.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            No drivers found
          </div>
        ) : (
          displayed.map((driver) => (
            <DriverRow
              key={driver.id}
              driver={driver}
              isSelected={driver.id === selectedDriverId}
              onClick={() => onDriverClick(driver.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
