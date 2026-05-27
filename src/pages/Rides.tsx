import { useMemo, useState } from 'react';
import { useRideStore } from '../store/useRideStore';
import RidesTable from '../components/rides/RidesTable';
import AssignModal from '../components/rides/AssignModal';
import type { Ride } from '../types';

type StatusFilter = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAGE_SIZE = 20;

export default function Rides() {
  const rides = useRideStore((s) => s.rides);
  const pendingRides = useRideStore((s) => s.pendingRides);
  const updateRide = useRideStore((s) => s.updateRide);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [assigningRide, setAssigningRide] = useState<Ride | null>(null);

  const filteredRides = useMemo(() => {
    let list = [...rides];
    if (statusFilter !== 'all') {
      list = list.filter((r) =>
        statusFilter === 'active'
          ? r.status === 'active' || r.status === 'accepted'
          : r.status === statusFilter,
      );
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.passenger.name.toLowerCase().includes(q) ||
          r.pickup.address?.toLowerCase().includes(q) ||
          r.destination.address?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [rides, statusFilter, search]);

  const totalPages = Math.ceil(filteredRides.length / PAGE_SIZE);
  const pageRides = filteredRides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAssigned = (rideId: string) => {
    updateRide(rideId, { status: 'accepted' });
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Rides
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {filteredRides.length > 0 ? `${filteredRides.length} total` : ''}
            {pendingRides.length > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--color-danger)', fontWeight: 600 }}>
                · {pendingRides.length} pending
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search passenger or location…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            width: 260,
            padding: '8px 14px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            color: 'var(--color-text-primary)',
            fontSize: 13,
            fontFamily: 'Space Grotesk, sans-serif',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTERS.map(({ label, value }) => {
          const isPending = value === 'pending' && pendingRides.length > 0;
          const isActive = statusFilter === value;
          return (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--border-radius-pill)',
                border: isActive ? 'none' : '1px solid var(--color-border)',
                background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {label}
              {isPending && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-danger)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {pendingRides.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <RidesTable
          rides={pageRides}
          loading={false}
          onAssign={(ride) => setAssigningRide(ride)}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={paginationBtnStyle(page === 1)}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={paginationBtnStyle(page === totalPages)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Assign modal */}
      {assigningRide && (
        <AssignModal
          ride={assigningRide}
          onClose={() => setAssigningRide(null)}
          onAssigned={() => handleAssigned(assigningRide.id)}
        />
      )}
    </div>
  );
}

function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    background: disabled ? 'transparent' : 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
    fontSize: 13,
    fontFamily: 'Space Grotesk, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
