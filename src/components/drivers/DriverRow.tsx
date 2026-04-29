import type { Driver } from '../../types';
import { formatDistance } from '../../utils/distance';

interface Props {
  driver: Driver;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_DOT: Record<Driver['status'], string> = {
  online: '#2DBF6E',
  busy: '#F59E0B',
  offline: '#4B5563',
};

export default function DriverRow({ driver, isSelected, onClick }: Props) {
  const initials = driver.avatarInitials || driver.name.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: isSelected ? 'var(--color-primary-light)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--border-radius-sm)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'var(--transition)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-2)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: STATUS_DOT[driver.status],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {driver.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
          {driver.state}
          {driver.distanceKm != null && (
            <> · {formatDistance(driver.distanceKm)}</>
          )}
        </div>
      </div>

      {/* Status dot */}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: STATUS_DOT[driver.status],
          flexShrink: 0,
        }}
      />
    </button>
  );
}
