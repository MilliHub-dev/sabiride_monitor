import { useDriverStore } from '../../store/useDriverStore';
import { useRideStore } from '../../store/useRideStore';
import { useStreamStore } from '../../store/useStreamStore';

interface StatItem {
  label: string;
  value: number | string;
  color?: string;
}

export default function TopNav() {
  const drivers = useDriverStore((s) => s.drivers);
  const rides = useRideStore((s) => s.rides);
  const pendingRides = useRideStore((s) => s.pendingRides);
  const streams = useStreamStore((s) => s.streams);

  const items: StatItem[] = [
    { label: 'Online Drivers', value: drivers.filter((d) => d.status === 'online').length, color: 'var(--color-primary)' },
    { label: 'Pending Rides', value: pendingRides.length, color: 'var(--color-danger)' },
    { label: 'Active Rides', value: rides.filter((r) => r.status === 'active').length, color: 'var(--color-warning)' },
    { label: 'Completed', value: rides.filter((r) => r.status === 'completed').length, color: 'var(--color-text-primary)' },
    { label: 'Live Streams', value: streams.length, color: 'var(--color-info)' },
  ];

  return (
    <header
      style={{
        height: 56,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 32,
        flexShrink: 0,
      }}
    >
      {items.map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 20,
              fontWeight: 600,
              color: color ?? 'var(--color-text-primary)',
            }}
          >
            {value}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
        </div>
      ))}
    </header>
  );
}
