import { useEffect, useState } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { getActiveStreams } from '../api/streams';
import StreamGrid from '../components/streams/StreamGrid';
import StreamViewer from '../components/streams/StreamViewer';
import type { Stream } from '../types';

export default function Streams() {
  const streams = useStreamStore((s) => s.streams);
  const setStreams = useStreamStore((s) => s.setStreams);

  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);

  useEffect(() => {
    const fetch = () =>
      getActiveStreams()
        .then((res) => {
          setStreams(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

    fetch();
    // Poll every 15s as a fallback to WebSocket stream.started/ended events
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [setStreams]);

  // Auto-close viewer if stream ends (WebSocket removes it from store)
  useEffect(() => {
    if (activeStream && !streams.find((s) => s.id === activeStream.id)) {
      setActiveStream(null);
    }
  }, [streams, activeStream]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Live Streams
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {loading ? 'Loading…' : `${streams.length} active`}
          </p>
        </div>

        {streams.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--border-radius-pill)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-live)',
                display: 'inline-block',
                animation: 'pulse-dot 1s infinite',
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-live)', letterSpacing: '0.06em' }}>
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <StreamGrid
          streams={streams}
          loading={loading}
          onSelect={(stream) => setActiveStream(stream)}
        />
      </div>

      {/* Viewer modal */}
      {activeStream && (
        <StreamViewer stream={activeStream} onClose={() => setActiveStream(null)} />
      )}
    </div>
  );
}
