import { useEffect, useState } from 'react';
import type { Ride } from '../../types';
import { formatNaira, formatElapsed } from '../../utils/format';

interface Props {
  rides: Ride[];
  onAssign: (ride: Ride) => void;
  onDismiss: (rideId: string) => void;
}

function RideCard({
  ride,
  onAssign,
  onDismiss,
}: {
  ride: Ride;
  onAssign: () => void;
  onDismiss: () => void;
}) {
  const [elapsed, setElapsed] = useState(ride.unacceptedSeconds ?? 0);
  const isUrgent = elapsed >= 120;

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${isUrgent ? 'var(--color-danger)' : 'var(--color-border)'}`,
        borderRadius: 'var(--border-radius-md)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        minWidth: 260,
        transition: 'border-color 0.3s',
      }}
    >
      {/* Close */}
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
        }}
      >
        ×
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--color-danger)',
            display: 'inline-block',
            animation: 'pulse-dot 1s infinite',
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '0.06em' }}>
          NEW RIDE REQUEST
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        <Row label="Passenger" value={ride.passenger.name} />
        <Row label="From" value={ride.pickup.address ?? `${ride.pickup.lat.toFixed(4)}, ${ride.pickup.lng.toFixed(4)}`} />
        <Row label="To" value={ride.destination.address ?? `${ride.destination.lat.toFixed(4)}, ${ride.destination.lng.toFixed(4)}`} />
        <Row label="Fare" value={formatNaira(ride.fare)} highlight />
      </div>

      {/* Timer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
          borderTop: '1px solid var(--color-border)',
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Unaccepted</span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            fontWeight: 500,
            color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-primary)',
            animation: isUrgent ? 'flash 0.8s step-end infinite' : 'none',
          }}
        >
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* Action */}
      <button
        onClick={onAssign}
        style={{
          width: '100%',
          padding: '8px 0',
          background: 'var(--color-primary)',
          border: 'none',
          borderRadius: 'var(--border-radius-sm)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: 'pointer',
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        Assign driver →
      </button>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)',
          fontWeight: highlight ? 600 : 400,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function RidePopupCard({ rides, onAssign, onDismiss }: Props) {
  if (rides.length === 0) return null;

  // Show max 3, rest scrollable
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
      }}
    >
      {rides.slice(0, 3).map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
          onAssign={() => onAssign(ride)}
          onDismiss={() => onDismiss(ride.id)}
        />
      ))}
      {rides.length > 3 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--color-text-muted)',
            padding: '4px 0',
          }}
        >
          +{rides.length - 3} more pending
        </div>
      )}
    </div>
  );
}
