import { useCallback } from 'react';
import { getMonitorRides, type MonitorRide } from '../api/monitor';
import { useFilteredList } from '../hooks/useFilteredList';
import DataTable, { type Column } from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDateTime, dash } from '../utils/format';

// Values as the backend stores them (RideStatus / ServiceType).
const STATUS_COLOURS: Record<string, string> = {
  active: 'var(--color-primary)',
  matched: 'var(--color-warning)',
  complete: 'var(--color-text-secondary)',
  cancel: 'var(--color-danger)',
};

const columns: Column<MonitorRide>[] = [
  {
    key: 'id',
    header: 'Ride',
    render: (r) => (
      <code style={{ fontFamily: 'monospace', fontSize: 12 }}>
        {r.id.slice(-8).toUpperCase()}
      </code>
    ),
  },
  { key: 'passenger', header: 'Passenger', render: (r) => dash(r.passenger?.full_name) },
  { key: 'pphone', header: 'Passenger phone', render: (r) => dash(r.passenger?.phone_number) },
  { key: 'driver', header: 'Driver', render: (r) => dash(r.driver?.full_name) },
  { key: 'state', header: 'State', render: (r) => dash(r.passenger?.state) },
  { key: 'service', header: 'Service', render: (r) => dash(r.service_type) },
  {
    key: 'riders',
    header: 'Riders',
    render: (r) => r.participant_count,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span style={{ color: STATUS_COLOURS[r.status] ?? 'var(--color-text-secondary)' }}>
        {r.status}
      </span>
    ),
  },
  { key: 'created', header: 'Created', render: (r) => formatDateTime(r.created_at) },
];

export default function AllRides() {
  const fetcher = useCallback(
    (params: Record<string, string | number>) => getMonitorRides(params),
    [],
  );
  const list = useFilteredList<MonitorRide>(fetcher, {
    status: 'all',
    service_type: 'all',
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="All Rides" count={list.count} noun="ride" />

      <FilterBar
        search={list.filters.search}
        onSearchChange={(v) => list.setFilter('search', v)}
        searchPlaceholder="Passenger or driver name / phone"
        state={list.filters.state}
        onStateChange={(v) => list.setFilter('state', v)}
        stateOptions={list.stateOptions}
        dateFrom={list.filters.dateFrom}
        onDateFromChange={(v) => list.setFilter('dateFrom', v)}
        dateTo={list.filters.dateTo}
        onDateToChange={(v) => list.setFilter('dateTo', v)}
        onReset={list.reset}
        extras={[
          {
            label: 'Status',
            value: list.filters.status,
            onChange: (v) => list.setFilter('status', v),
            options: [
              { label: 'All', value: 'all' },
              { label: 'Matched', value: 'matched' },
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'complete' },
              { label: 'Cancelled', value: 'cancel' },
            ],
          },
          {
            label: 'Service',
            value: list.filters.service_type,
            onChange: (v) => list.setFilter('service_type', v),
            options: [
              { label: 'All', value: 'all' },
              { label: 'Standard', value: 'standard' },
              { label: 'Shared', value: 'shared' },
              { label: 'Group', value: 'group' },
              { label: 'Dispatch', value: 'dispatch' },
              { label: 'Luxury', value: 'luxury' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(r) => r.id}
        loading={list.loading}
        error={list.error}
        emptyMessage="No rides match these filters"
        page={list.page}
        totalPages={list.totalPages}
        count={list.count}
        onPageChange={list.setPage}
      />
    </div>
  );
}
