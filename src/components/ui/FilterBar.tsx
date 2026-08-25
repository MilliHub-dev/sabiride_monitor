import type { CSSProperties, ReactNode } from 'react';

/**
 * The filter row shared by every data screen.
 *
 * Search, state and a date window are common to all four resources, so they
 * live here; anything resource-specific (ride status, online/offline) is passed
 * in through `extras` rather than being special-cased.
 */

export interface SelectFilter {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  state: string;
  onStateChange: (value: string) => void;
  /** States seen in the current result set, so the list stays relevant. */
  stateOptions: string[];
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  extras?: SelectFilter[];
  onReset: () => void;
  children?: ReactNode;
}

const fieldStyle: CSSProperties = {
  height: 36,
  padding: '0 10px',
  borderRadius: 'var(--border-radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 13,
  outline: 'none',
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--color-text-secondary)',
  marginBottom: 4,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Name, email or phone',
  state,
  onStateChange,
  stateOptions,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  extras = [],
  onReset,
  children,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-end',
        padding: 16,
        marginBottom: 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md)',
      }}
    >
      <Field label="Search">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          style={{ ...fieldStyle, minWidth: 220 }}
        />
      </Field>

      <Field label="State">
        <select
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          style={{ ...fieldStyle, minWidth: 140 }}
        >
          <option value="">All states</option>
          {stateOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      {extras.map((extra) => (
        <Field key={extra.label} label={extra.label}>
          <select
            value={extra.value}
            onChange={(e) => extra.onChange(e.target.value)}
            style={{ ...fieldStyle, minWidth: 140 }}
          >
            {extra.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      ))}

      <Field label="From">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          style={fieldStyle}
        />
      </Field>

      <Field label="To">
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          style={fieldStyle}
        />
      </Field>

      {children}

      <button
        type="button"
        onClick={onReset}
        style={{
          ...fieldStyle,
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
        }}
      >
        Reset
      </button>
    </div>
  );
}
