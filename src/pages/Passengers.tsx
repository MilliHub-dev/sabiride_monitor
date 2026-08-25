import { useCallback } from 'react';
import { getMonitorPassengers, type MonitorPassenger } from '../api/monitor';
import { useFilteredList } from '../hooks/useFilteredList';
import DataTable, { type Column } from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDateTime, dash } from '../utils/format';

const columns: Column<MonitorPassenger>[] = [
  { key: 'name', header: 'Passenger', render: (p) => dash(p.full_name) },
  { key: 'phone', header: 'Phone', render: (p) => dash(p.phone_number) },
  { key: 'email', header: 'Email', render: (p) => dash(p.email) },
  { key: 'state', header: 'State', render: (p) => dash(p.state) },
  {
    key: 'online',
    header: 'Status',
    render: (p) => (
      <span style={{ color: p.is_online ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
        {p.is_online ? 'Online' : 'Offline'}
      </span>
    ),
  },
  { key: 'joined', header: 'Signed up', render: (p) => formatDateTime(p.created_at) },
];

export default function Passengers() {
  const fetcher = useCallback(
    (params: Record<string, string | number>) => getMonitorPassengers(params),
    [],
  );
  const list = useFilteredList<MonitorPassenger>(fetcher, { is_online: 'all' });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="Sabi Passengers" count={list.count} noun="passenger" />

      <FilterBar
        search={list.filters.search}
        onSearchChange={(v) => list.setFilter('search', v)}
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
            label: 'Availability',
            value: list.filters.is_online,
            onChange: (v) => list.setFilter('is_online', v),
            options: [
              { label: 'All', value: 'all' },
              { label: 'Online', value: 'true' },
              { label: 'Offline', value: 'false' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(p) => p.passenger_id}
        loading={list.loading}
        error={list.error}
        emptyMessage="No passengers match these filters"
        page={list.page}
        totalPages={list.totalPages}
        count={list.count}
        onPageChange={list.setPage}
      />
    </div>
  );
}
