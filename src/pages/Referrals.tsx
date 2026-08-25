import { useCallback } from 'react';
import { getMonitorReferrals, type MonitorReferrer } from '../api/monitor';
import { useFilteredList } from '../hooks/useFilteredList';
import DataTable, { type Column } from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDateTime, dash } from '../utils/format';

const columns: Column<MonitorReferrer>[] = [
  { key: 'name', header: 'User', render: (r) => dash(r.full_name) },
  { key: 'phone', header: 'Phone', render: (r) => dash(r.phone_number) },
  {
    key: 'code',
    header: 'Referral code',
    render: (r) => (
      <code
        style={{
          fontFamily: 'monospace',
          fontSize: 12,
          padding: '2px 6px',
          borderRadius: 'var(--border-radius-sm)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {r.referral_code}
      </code>
    ),
  },
  { key: 'state', header: 'State', render: (r) => dash(r.state) },
  {
    key: 'total',
    header: 'Referred',
    render: (r) => (
      <strong style={{ color: 'var(--color-text-primary)' }}>{r.total_referrals}</strong>
    ),
  },
  { key: 'signups', header: 'Signed up', render: (r) => r.completed_signups },
  { key: 'rides', header: 'First ride done', render: (r) => r.completed_first_rides },
  {
    key: 'points',
    header: 'Points earned',
    render: (r) => r.points_from_referrals.toLocaleString(),
  },
  { key: 'joined', header: 'Joined', render: (r) => formatDateTime(r.date_joined) },
];

export default function Referrals() {
  const fetcher = useCallback(
    (params: Record<string, string | number>) => getMonitorReferrals(params),
    [],
  );
  const list = useFilteredList<MonitorReferrer>(fetcher, { min_referrals: 'all' });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="Referrals" count={list.count} noun="user" />

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
            label: 'Referrals',
            value: list.filters.min_referrals,
            onChange: (v) => list.setFilter('min_referrals', v),
            options: [
              { label: 'Any', value: 'all' },
              { label: 'At least 1', value: '1' },
              { label: 'At least 5', value: '5' },
              { label: 'At least 10', value: '10' },
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
        emptyMessage="No users match these filters"
        page={list.page}
        totalPages={list.totalPages}
        count={list.count}
        onPageChange={list.setPage}
      />
    </div>
  );
}
