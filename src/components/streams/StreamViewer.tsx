import { useEffect, useRef, useState } from 'react';
import type { Stream } from '../../types';
import { useAgoraStream } from '../../hooks/useAgoraStream';

interface Props {
  stream: Stream;
  onClose: () => void;
}

const PLAYER_ID = 'agora-stream-player';

export default function StreamViewer({ stream, onClose }: Props) {
  const { join, leave } = useAgoraStream();
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const audioTrackRef = useRef<{ setVolume: (v: number) => void } | null>(null);

  useEffect(() => {
    join(stream.channelName, PLAYER_ID)
      .then((client) => {
        setStatus('live');
        // Store audio track ref for mute control
        client.on('user-published', async (user, mediaType) => {
          if (mediaType === 'audio' && user.audioTrack) {
            audioTrackRef.current = user.audioTrack;
          }
        });
      })
      .catch(() => setStatus('error'));

    return () => {
      leave();
    };
  }, [stream.channelName, join, leave]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioTrackRef.current?.setVolume(next ? 0 : 100);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Video container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div
          id={PLAYER_ID}
          style={{ width: '100%', height: '100%', background: '#000' }}
        />

        {/* Connecting overlay */}
        {status === 'connecting' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            <div style={{ fontSize: 32 }}>📡</div>
            <div style={{ fontSize: 14 }}>Connecting to stream…</div>
          </div>
        )}

        {status === 'error' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--color-danger)',
            }}
          >
            <div style={{ fontSize: 32 }}>⚠</div>
            <div style={{ fontSize: 14 }}>Failed to connect to stream</div>
            <button
              onClick={onClose}
              style={{
                marginTop: 8,
                padding: '8px 20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--color-text-secondary)',
                fontSize: 13,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* Driver badge — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {stream.driver.avatarInitials ?? stream.driver.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {stream.driver.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {stream.locationLabel ?? stream.driver.state}
            </div>
          </div>
        </div>

        {/* Viewer count — top right */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 70,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: 'var(--border-radius-pill)',
          }}
        >
          <span style={{ fontSize: 13 }}>👁</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#fff' }}>
            {stream.viewerCount}
          </span>
        </div>

        {/* LIVE badge — top left */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            background: 'var(--color-live)',
            borderRadius: 'var(--border-radius-pill)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>LIVE</span>
        </div>
      </div>

      {/* Controls bar */}
      <div
        style={{
          height: 56,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Viewing as audience · read-only
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={toggleMute}
            style={{
              padding: '7px 16px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
