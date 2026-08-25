import type { CSSProperties, ReactNode } from 'react';

/**
 * Table + pagination shared by the data screens.
 *
 * Loading, empty and error are rendered here rather than in each page, so the
 * four screens cannot drift apart on the states that are easiest to forget.
 */

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: number | string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  page: number;
  totalPages: number;
  count: number;
  onPageChange: (page: number) => void;
}

const cellBase: CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 13,
  borderBottom: '1px solid var(--color-border)',
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  emptyMessage = 'Nothing to show',
  page,
  totalPages,
  count,
  onPageChange,
}: Props<T>) {
  const message = error
    ? error
    : loading
      ? 'Loading…'
      : rows.length === 0
        ? emptyMessage
        : null;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...cellBase,
                    width: col.width,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    color: 'var(--color-text-secondary)',
                    background: 'var(--color-bg)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {message ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...cellBase,
                    textAlign: 'center',
                    padding: 32,
                    color: error ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                  }}
                >
                  {message}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} style={cellBase}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>
          {count} {count === 1 ? 'result' : 'results'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            style={pagerStyle(page <= 1 || loading)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            style={pagerStyle(page >= totalPages || loading)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const pagerStyle = (disabled: boolean): CSSProperties => ({
  height: 30,
  padding: '0 12px',
  borderRadius: 'var(--border-radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 12,
});
