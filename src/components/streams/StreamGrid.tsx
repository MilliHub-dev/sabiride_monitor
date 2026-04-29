import type { Stream } from '../../types';
import StreamCard from './StreamCard';

interface Props {
  streams: Stream[];
  loading: boolean;
  onSelect: (stream: Stream) => void;
}

export default function StreamGrid({ streams, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'var(--color-surface-2)',
                animation: 'skeleton-pulse 1.4s ease-in-out infinite',
              }}
            />
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  height: 13,
                  width: '60%',
                  background: 'var(--color-surface-2)',
                  borderRadius: 4,
                  animation: 'skeleton-pulse 1.4s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  height: 11,
                  width: '40%',
                  background: 'var(--color-surface-2)',
                  borderRadius: 4,
                  animation: 'skeleton-pulse 1.4s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          color: 'var(--color-text-muted)',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 40 }}>📡</span>
        <div style={{ fontSize: 14, fontWeight: 500 }}>No active streams</div>
        <div style={{ fontSize: 12 }}>Streams will appear here when drivers go live</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {streams.map((stream) => (
        <StreamCard key={stream.id} stream={stream} onClick={() => onSelect(stream)} />
      ))}
    </div>
  );
}
