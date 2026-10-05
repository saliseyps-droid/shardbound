import { create } from 'zustand';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KEYWORD_NAME_PATTERN, keywordByName } from '@/data/keywords';

interface TipData {
  title?: string;
  body: string;
  rect: DOMRect;
  /** Opened by a long press (touch): stays until the next tap anywhere. */
  sticky?: boolean;
}
interface TipState {
  tip: TipData | null;
  show: (tip: TipData) => void;
  hide: () => void;
}

const useTip = create<TipState>((set) => ({
  tip: null,
  show: (tip) => set({ tip }),
  hide: () => set({ tip: null }),
}));

/** Touch: shows the tooltip of the <Tip> around `el` (from a long press); false when there is none. */
export function showTipFor(el: HTMLElement): boolean {
  const host = el.closest<HTMLElement>('[data-tip-body]');
  if (!host) return false;
  useTip.getState().show({ title: host.dataset.tipTitle || undefined, body: host.dataset.tipBody ?? '', rect: host.getBoundingClientRect(), sticky: true });
  return true;
}

/** Wraps content with a hover/focus tooltip rendered in a global fixed layer. */
export function Tip({ title, body, children, className }: { title?: string; body: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const show = useTip((s) => s.show);
  const hide = useTip((s) => s.hide);
  // A long-press tooltip (sticky) stays until the next tap: the compat mouse / focus events a
  // touch sends on release must not replace or hide it.
  const open = () => ref.current && !useTip.getState().tip?.sticky && show({ title, body, rect: ref.current.getBoundingClientRect() });
  const softHide = () => !useTip.getState().tip?.sticky && hide();
  useEffect(() => hide, [hide]);
  return (
    <span
      ref={ref}
      className={className}
      tabIndex={0}
      data-tip-title={title}
      data-tip-body={body}
      onMouseEnter={open}
      onMouseLeave={softHide}
      onFocus={open}
      onBlur={softHide}
      aria-label={title ? `${title}: ${body}` : body}
    >
      {children}
    </span>
  );
}

export function TooltipLayer() {
  const tip = useTip((s) => s.tip);
  const hide = useTip((s) => s.hide);
  // A long-press tooltip closes on the next tap anywhere.
  useEffect(() => {
    if (!tip?.sticky) return;
    const close = () => hide();
    window.addEventListener('pointerdown', close, true);
    return () => window.removeEventListener('pointerdown', close, true);
  }, [tip, hide]);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!tip) return setPos(null);
    const w = 280;
    const left = Math.min(window.innerWidth - w - 8, Math.max(8, tip.rect.left + tip.rect.width / 2 - w / 2));
    const above = tip.rect.top > 140;
    setPos({ left, top: above ? tip.rect.top - 8 : tip.rect.bottom + 8, above });
  }, [tip]);
  if (!tip || !pos) return null;
  return (
    <div
      ref={boxRef}
      role="tooltip"
      className={`tooltip-bubble ${tip.sticky ? 'is-sticky' : ''}`}
      style={{ left: pos.left, top: pos.top, transform: pos.above ? 'translateY(-100%)' : undefined }}
    >
      {tip.title && <strong>{tip.title}</strong>}
      <span>{tip.body}</span>
    </div>
  );
}

/** Rules text with keyword names highlighted and explained on hover. */
export function KeywordText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(KEYWORD_NAME_PATTERN.source, 'gu');
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const kw = keywordByName(m[0]);
    parts.push(
      kw ? (
        <Tip key={i++} title={kw.name} body={kw.definition} className="kw">
          {m[0]}
        </Tip>
      ) : (
        m[0]
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
