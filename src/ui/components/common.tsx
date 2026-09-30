import { useEffect, useRef, type ReactNode } from 'react';
import { create } from 'zustand';
import { useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { EssenceIcon, GoldIcon, PackIcon } from './Icons';

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  className = '',
  labelledBy,
}: {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  className?: string;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} className={`modal panel ${wide ? 'modal-wide' : ''} ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}>
        {title && (
          <div className="modal-head">
            <h3 id={labelledBy}>{title}</h3>
            {onClose && (
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm dialog (promise based)
// ---------------------------------------------------------------------------

interface ConfirmRequest {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

const useConfirmStore = create<{ req: ConfirmRequest | null; set: (r: ConfirmRequest | null) => void }>((set) => ({
  req: null,
  set: (req) => set({ req }),
}));

export function confirmDialog(opts: Omit<ConfirmRequest, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.getState().set({ ...opts, resolve }));
}

export function ConfirmHost() {
  const req = useConfirmStore((s) => s.req);
  const set = useConfirmStore((s) => s.set);
  if (!req) return null;
  const close = (ok: boolean) => {
    req.resolve(ok);
    set(null);
  };
  return (
    <Modal open onClose={() => close(false)} title={req.title} labelledBy="confirm-title">
      <div className="confirm-body">{req.message}</div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={() => close(false)}>
          {req.cancelLabel ?? 'Cancel'}
        </button>
        <button className={`btn ${req.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => close(true)} autoFocus>
          {req.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

export function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className={`toast toast-${t.kind}`} onClick={() => dismiss(t.id)}>
          {t.message}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small display pieces
// ---------------------------------------------------------------------------

export function Gold({ amount, size }: { amount: number; size?: number }) {
  return (
    <span className="currency" title="Gold">
      <GoldIcon size={size} />
      <span>{amount.toLocaleString()}</span>
      <span className="sr-only">Gold</span>
    </span>
  );
}

export function Essence({ amount, size }: { amount: number; size?: number }) {
  return (
    <span className="currency essence" title="Essence">
      <EssenceIcon size={size} />
      <span>{amount.toLocaleString()}</span>
      <span className="sr-only">Essence</span>
    </span>
  );
}

export function Packs({ amount }: { amount: number }) {
  return (
    <span className="currency" title="Unopened packs">
      <PackIcon />
      <span>{amount}</span>
      <span className="sr-only">unopened packs</span>
    </span>
  );
}

export function ProgressBar({ value, max, gold, label }: { value: number; max: number; gold?: boolean; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 100;
  return (
    <div className={`bar ${gold ? 'gold' : ''}`} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ScreenHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="screen-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="screen-actions">{actions}</div>}
    </header>
  );
}

/** Button that plays the UI click sound. */
export function SfxButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      onClick={(e) => {
        audio.play('click');
        props.onClick?.(e);
      }}
    />
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner" role="status">
      <span className="spinner-shard" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
