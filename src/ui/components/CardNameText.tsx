import { useState } from 'react';
import { createPortal } from 'react-dom';
import { collectibleCards } from '@/data/cards';
import { useUi } from '@/state/uiStore';
import { CardView, isTouchScreen } from '@/ui/components/CardView';
import '@/ui/styles/cardNameText.css';

const PREVIEW_W = 220;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let cache: { key: string; re: RegExp; byName: Map<string, string> } | null = null;

/** One regex over every collectible card name (in the active language), longest names first. */
function matcher() {
  const cards = collectibleCards();
  const key = `${cards.length}:${cards[0]?.name}`;
  if (cache?.key === key) return cache;
  const byName = new Map<string, string>();
  for (const c of cards) if (c.name.length >= 4 && !byName.has(c.name)) byName.set(c.name, c.id);
  // Legendaries are often written by their short name ("Azhrel" for "Azhrel, the Drowned Champion").
  for (const c of cards) {
    const short = c.name.split(', ')[0];
    if (short !== c.name && short.length >= 4 && !byName.has(short)) byName.set(short, c.id);
  }
  const names = [...byName.keys()].sort((a, b) => b.length - a.length).map(escape);
  // Whole names only: not glued to other letters (\p{L} covers Czech diacritics).
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${names.join('|')})(?![\\p{L}\\p{N}])`, 'gu');
  cache = { key, re, byName };
  return cache;
}

/** Splits text into plain parts and card names (the name's card id). */
export function splitCardNames(text: string): { text: string; cardId?: string }[] {
  const { re, byName } = matcher();
  const out: { text: string; cardId?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at) });
    out.push({ text: m[0], cardId: byName.get(m[0]) });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

function Preview({ id, rect }: { id: string; rect: DOMRect }) {
  const h = PREVIEW_W * 1.4;
  const top = Math.max(8, Math.min(window.innerHeight - h - 8, rect.top + rect.height / 2 - h / 2));
  // Right of the name when there is room, otherwise left of it.
  const left = rect.right + 24 + PREVIEW_W < window.innerWidth ? rect.right + 24 : Math.max(8, rect.left - PREVIEW_W - 24);
  return createPortal(
    <div className="text-card-name-preview" style={{ top, left }} aria-hidden>
      <CardView card={id} width={PREVIEW_W} />
    </div>,
    document.body,
  );
}

/** Text with every card name highlighted: hover shows the card, click opens the large view. */
export function CardNameText({ text }: { text: string }) {
  const [hover, setHover] = useState<{ id: string; rect: DOMRect } | null>(null);
  return (
    <>
      {splitCardNames(text).map((part, i) =>
        part.cardId ? (
          <span
            key={i}
            role="button"
            tabIndex={0}
            className="text-card-name"
            onMouseEnter={(e) => !isTouchScreen() && setHover({ id: part.cardId!, rect: e.currentTarget.getBoundingClientRect() })}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
              setHover(null);
              useUi.getState().inspectCard(part.cardId!);
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              useUi.getState().inspectCard(part.cardId!);
            }}
          >
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
      {hover && <Preview id={hover.id} rect={hover.rect} />}
    </>
  );
}
