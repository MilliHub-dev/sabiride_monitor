import type { Ride } from '../../types';
import RideRow from './RideRow';

interface Props {
  rides: Ride[];
  loading: boolean;
  onAssign: (ride: Ride) => void;
}

const COLS = ['Ride ID', 'Passenger', 'Pickup', 'Destination', 'Fare', 'Time', 'Status', 'Action'];

export default function RidesTable({ rides, loading, onAssign }: Props) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {COLS.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Loading rides…
                </td>
              </tr>
            )}
            {!loading && rides.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  No rides found
                </td>
              </tr>
            )}
            {!loading &&
              rides.map((ride) => (
                <RideRow key={ride.id} ride={ride} onAssign={() => onAssign(ride)} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
