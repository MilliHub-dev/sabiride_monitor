interface Props {
  title: string;
  count?: number;
  noun?: string;
}

/** Title row shared by the data screens. */
export default function PageHeader({ title, count, noun }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {title}
      </h1>
      {count !== undefined && (
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {count.toLocaleString()} {noun}
          {count === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}
