import type { Ride } from '../../types';

type Status = Ride['status'];

const CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  accepted:  { label: 'Active',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  active:    { label: 'Active',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  completed: { label: 'Done',      color: '#2DBF6E', bg: 'rgba(45,191,110,0.12)' },
  cancelled: { label: 'Cancelled', color: '#4B5563', bg: 'rgba(75,85,99,0.2)' },
};

interface Props {
  status: Status;
}

export default function StatusBadge({ status }: Props) {
  const { label, color, bg } = CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 'var(--border-radius-pill)',
        background: bg,
        fontSize: 11,
        fontWeight: 600,
        color,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
