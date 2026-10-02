import { create } from 'zustand';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KEYWORD_NAME_PATTERN, keywordByName } from '@/data/keywords';

interface TipState {
  tip: { title?: string; body: string; rect: DOMRect } | null;
  show: (tip: { title?: string; body: string; rect: DOMRect }) => void;
  hide: () => void;
}

const useTip = create<TipState>((set) => ({
  tip: null,
  show: (tip) => set({ tip }),
  hide: () => set({ tip: null }),
}));

/** Wraps content with a hover/focus tooltip rendered in a global fixed layer. */
export function Tip({ title, body, children, className }: { title?: string; body: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const show = useTip((s) => s.show);
  const hide = useTip((s) => s.hide);
  const open = () => ref.current && show({ title, body, rect: ref.current.getBoundingClientRect() });
  useEffect(() => hide, [hide]);
  return (
    <span
      ref={ref}
      className={className}
      tabIndex={0}
      onMouseEnter={open}
      onMouseLeave={hide}
      onFocus={open}
      onBlur={hide}
      aria-label={title ? `${title}: ${body}` : body}
    >
      {children}
    </span>
  );
}

export function TooltipLayer() {
  const tip = useTip((s) => s.tip);
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
      className="tooltip-bubble"
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
