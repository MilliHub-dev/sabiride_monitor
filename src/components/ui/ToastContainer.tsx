import { useToastStore } from '../../store/useToastStore';
import type { Toast, ToastType } from '../../store/useToastStore';

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(45,191,110,0.12)', border: 'rgba(45,191,110,0.3)', icon: '✓' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '✕' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '!' },
};

const ICON_COLOR: Record<ToastType, string> = {
  success: 'var(--color-primary)',
  error:   'var(--color-danger)',
  warning: 'var(--color-warning)',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const s = TOAST_STYLES[toast.type];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 14px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--border-radius-md)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        minWidth: 260,
        maxWidth: 380,
        animation: 'toast-in 0.2s ease',
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `1.5px solid ${ICON_COLOR[toast.type]}`,
          color: ICON_COLOR[toast.type],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {s.icon}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}>
        {toast.message}
      </span>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
