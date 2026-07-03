import type { Stream } from '../../types';

interface Props {
  stream: Stream;
  onClick: () => void;
}

export default function StreamCard({ stream, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        padding: 0,
        transition: 'border-color var(--transition), transform var(--transition)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Thumbnail / placeholder */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#060d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Play icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(45,191,110,0.15)',
            border: '1.5px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18, marginLeft: 3, color: 'var(--color-primary)' }}>▶</span>
        </div>

        {/* LIVE badge */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            background: 'var(--color-live)',
            borderRadius: 'var(--border-radius-pill)',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#fff',
              display: 'inline-block',
              animation: 'pulse-dot 1s infinite',
            }}
          />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>
            LIVE
          </span>
        </div>

        {/* Viewer count */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: 'var(--border-radius-pill)',
          }}
        >
          <span style={{ fontSize: 11, color: '#fff' }}>👁</span>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
            {stream.viewerCount}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
          {stream.driver.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {stream.locationLabel ?? (stream.driver.state || 'Unknown')}
          {stream.driver.vehicleType && (
            <span style={{ marginLeft: 6, color: 'var(--color-text-muted)' }}>
              · {stream.driver.vehicleType}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
