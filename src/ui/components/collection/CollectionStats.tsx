import { useMemo } from 'react';
import { collectibleCards } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { ALL_FACTIONS, RARITIES } from '@/game/types';
import type { CollectionState } from '@/domain/save';
import { ownedCopies } from '@/domain/save';
import { ProgressBar } from '@/ui/components/common';

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export interface CollectionSummary {
  owned: number;
  total: number;
  byRarity: Record<string, { owned: number; total: number }>;
  byFaction: Record<string, { owned: number; total: number }>;
}

export function summarizeCollection(collection: CollectionState): CollectionSummary {
  const byRarity: CollectionSummary['byRarity'] = {};
  const byFaction: CollectionSummary['byFaction'] = {};
  let owned = 0;
  const cards = collectibleCards();
  for (const c of cards) {
    const has = ownedCopies(collection, c.id) > 0 ? 1 : 0;
    owned += has;
    (byRarity[c.rarity] ??= { owned: 0, total: 0 }).total++;
    byRarity[c.rarity].owned += has;
    (byFaction[c.faction] ??= { owned: 0, total: 0 }).total++;
    byFaction[c.faction].owned += has;
  }
  return { owned, total: cards.length, byRarity, byFaction };
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function CollectionStats({ collection, children }: { collection: CollectionState; children?: React.ReactNode }) {
  const s = useMemo(() => summarizeCollection(collection), [collection]);
  return (
    <section className="stats-panel panel" aria-label="Collection statistics">
      <div className="stats-overall">
        <span className="stats-big num">{pct(s.owned, s.total)}%</span>
        <span className="muted">
          <strong className="num">
            {s.owned} / {s.total}
          </strong>{' '}
          unique cards collected
        </span>
      </div>
      <ProgressBar value={s.owned} max={s.total} gold label="Overall collection" />
      <h4 className="stats-sub">By rarity</h4>
      <ul className="stats-list">
        {RARITIES.map((r) => (
          <li key={r}>
            <span className={`rarity-text-${r.toLowerCase()}`}>{cap(r)}</span>
            <span className="num">
              {s.byRarity[r]?.owned ?? 0} / {s.byRarity[r]?.total ?? 0}
            </span>
          </li>
        ))}
      </ul>
      <h4 className="stats-sub">By faction</h4>
      <ul className="stats-list factions">
        {ALL_FACTIONS.map((f) => {
          const v = s.byFaction[f] ?? { owned: 0, total: 0 };
          return (
            <li key={f} style={{ '--fc': FACTIONS[f].colors.primary } as React.CSSProperties}>
              <span className="faction-name">{FACTIONS[f].short}</span>
              <span className="mini-bar" aria-hidden>
                <span style={{ width: `${pct(v.owned, v.total)}%` }} />
              </span>
              <span className="num">{pct(v.owned, v.total)}%</span>
            </li>
          );
        })}
      </ul>
      {children}
    </section>
  );
}
