import { useEffect, useState } from 'react';
import { getLiveStats } from '../../api/stats';
import type { LiveStats } from '../../types';

interface StatItem {
  label: string;
  value: number | string;
  color?: string;
}

export default function TopNav() {
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    const fetch = () =>
      getLiveStats()
        .then((res) => setStats(res.data))
        .catch(() => {});

    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  const items: StatItem[] = stats
    ? [
        { label: 'Online Drivers', value: stats.onlineDrivers, color: 'var(--color-primary)' },
        { label: 'Pending Rides', value: stats.pendingRides, color: 'var(--color-danger)' },
        { label: 'Active Rides', value: stats.activeRides, color: 'var(--color-warning)' },
        { label: 'Completed Today', value: stats.completedToday, color: 'var(--color-text-primary)' },
        { label: 'Live Streams', value: stats.activeStreams, color: 'var(--color-info)' },
      ]
    : [];

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
      {items.length === 0 ? (
        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Loading stats…</span>
      ) : (
        items.map(({ label, value, color }) => (
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
        ))
      )}
    </header>
  );
}
