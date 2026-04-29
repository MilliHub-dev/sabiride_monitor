import type { Ride } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { formatNaira, formatTime } from '../../utils/format';

interface Props {
  ride: Ride;
  onAssign: () => void;
}

export default function RideRow({ ride, onAssign }: Props) {
  const isPending = ride.status === 'pending';
  const isActive = ride.status === 'accepted' || ride.status === 'active';
  const shortId = ride.id.slice(-5).toUpperCase();

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: isPending ? 'rgba(239,68,68,0.03)' : 'transparent',
        transition: 'background var(--transition)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = isPending ? 'rgba(239,68,68,0.03)' : 'transparent')
      }
    >
      {/* Ride ID */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--color-text-secondary)' }}>
          #{shortId}
        </span>
      </td>

      {/* Passenger */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
          {ride.passenger.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
          {ride.passenger.phone}
        </div>
      </td>

      {/* Pickup */}
      <td style={{ padding: '12px 16px', maxWidth: 160 }}>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ride.pickup.address ?? '—'}
        </div>
      </td>

      {/* Destination */}
      <td style={{ padding: '12px 16px', maxWidth: 160 }}>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ride.destination.address ?? '—'}
        </div>
      </td>

      {/* Fare */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
          {formatNaira(ride.fare)}
        </span>
      </td>

      {/* Time */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>
          {formatTime(ride.createdAt)}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '12px 16px' }}>
        <StatusBadge status={ride.status} />
      </td>

      {/* Action */}
      <td style={{ padding: '12px 16px' }}>
        {isPending && (
          <button
            onClick={onAssign}
            style={{
              padding: '5px 12px',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            Assign →
          </button>
        )}
        {isActive && (
          <span style={{ fontSize: 12, color: 'var(--color-warning)', fontWeight: 500 }}>
            In progress
          </span>
        )}
        {!isPending && !isActive && (
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>
        )}
      </td>
    </tr>
  );
}
