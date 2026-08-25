import { useCallback } from 'react';
import { getMonitorDrivers, type MonitorDriver } from '../api/monitor';
import { useFilteredList } from '../hooks/useFilteredList';
import DataTable, { type Column } from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDateTime, dash } from '../utils/format';

const columns: Column<MonitorDriver>[] = [
  { key: 'name', header: 'Driver', render: (d) => dash(d.full_name) },
  { key: 'phone', header: 'Phone', render: (d) => dash(d.phone_number) },
  { key: 'email', header: 'Email', render: (d) => dash(d.email) },
  { key: 'state', header: 'State', render: (d) => dash(d.state) },
  {
    key: 'type',
    header: 'Type',
    render: (d) => (d.driver_type === 0 ? 'Dispatch rider' : 'Driver'),
  },
  {
    key: 'online',
    header: 'Status',
    render: (d) => (
      <span style={{ color: d.is_online ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
        {d.is_online ? 'Online' : 'Offline'}
      </span>
    ),
  },
  { key: 'rating', header: 'Rating', render: (d) => (d.rating_score ?? '—') },
  { key: 'joined', header: 'Joined', render: (d) => formatDateTime(d.date_joined) },
];

export default function Drivers() {
  const fetcher = useCallback(
    (params: Record<string, string | number>) => getMonitorDrivers(params),
    [],
  );
  const list = useFilteredList<MonitorDriver>(fetcher, {
    is_online: 'all',
    driver_type: 'all',
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="Sabi Drivers" count={list.count} noun="driver" />

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
          {
            label: 'Driver type',
            value: list.filters.driver_type,
            onChange: (v) => list.setFilter('driver_type', v),
            options: [
              { label: 'All', value: 'all' },
              { label: 'Dispatch rider', value: '0' },
              { label: 'Driver', value: '1' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(d) => d.driver_id}
        loading={list.loading}
        error={list.error}
        emptyMessage="No drivers match these filters"
        page={list.page}
        totalPages={list.totalPages}
        count={list.count}
        onPageChange={list.setPage}
      />
    </div>
  );
}
