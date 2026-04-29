import { useEffect, useState } from 'react';
import type { Ride, Driver } from '../../types';
import { assignDriver } from '../../api/rides';
import { getOnlineDrivers } from '../../api/drivers';
import { haversineKm, formatDistance } from '../../utils/distance';
import { formatNaira } from '../../utils/format';
import { toast } from '../../store/useToastStore';

interface Props {
  ride: Ride;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignModal({ ride, onClose, onAssigned }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getOnlineDrivers()
      .then((res) => {
        const sorted = res.data
          .map((d) => ({
            ...d,
            distanceKm: haversineKm(
              ride.pickup.lat, ride.pickup.lng,
              d.location.lat, d.location.lng,
            ),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm);
        setDrivers(sorted);
      })
      .catch(() => setError('Failed to load drivers'));
  }, [ride.pickup]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    try {
      await assignDriver(ride.id, selectedId);
      const driverName = drivers.find((d) => d.id === selectedId)?.name ?? 'driver';
      toast.success(`Ride #${ride.id.slice(-5).toUpperCase()} assigned to ${driverName}`);
      onAssigned();
      onClose();
    } catch {
      setError('Assignment failed — try again');
      toast.error('Assignment failed — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 24,
          width: 380,
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Assign driver to ride #{ride.id.slice(-4)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {ride.passenger.name} · {ride.pickup.address} → {ride.destination.address}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
            {formatNaira(ride.fare)}
          </div>
        </div>

        {/* Driver list */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select a driver
        </div>
        <div
          style={{
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--border-radius-md)',
            overflow: 'hidden',
            maxHeight: 220,
            overflowY: 'auto',
            marginBottom: 16,
          }}
        >
          {drivers.length === 0 && !error && (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
              Loading drivers…
            </div>
          )}
          {drivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => setSelectedId(driver.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                background: selectedId === driver.id ? 'var(--color-primary-light)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#2DBF6E',
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {driver.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {driver.distanceKm != null ? formatDistance(driver.distanceKm) : ''}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ fontSize: 12, color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || loading}
            style={{
              padding: '9px 18px',
              background: selectedId ? 'var(--color-primary)' : 'var(--color-surface-2)',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              color: selectedId ? '#fff' : 'var(--color-text-muted)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: selectedId && !loading ? 'pointer' : 'not-allowed',
              transition: 'var(--transition)',
            }}
          >
            {loading ? 'Assigning…' : 'Confirm Assign →'}
          </button>
        </div>
      </div>
    </div>
  );
}
