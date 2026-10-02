import { describe, expect, it } from 'vitest';
import { tr, tn } from '@/i18n';
import { allCards } from '@/data/cards';
import { FACTION_TALENTS, BOSS_TALENTS } from '@/data/wardenTalents';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { KEYWORDS } from '@/data/keywords';
import { PATCH_NOTES } from '@/data/patchNotes';

const SOURCES = import.meta.glob(['/src/**/*.ts', '/src/**/*.tsx', '!/src/i18n/**', '!/src/ui/screens/DebugScreen.tsx'], { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;
const CS_CARDS = import.meta.glob('/src/i18n/cs/cards/*.ts', { eager: true, import: 'default' }) as Record<string, Record<string, { name?: string }>>;
const CS_DATA = import.meta.glob('/src/i18n/cs/data/*.ts', { eager: true, import: 'default' }) as Record<string, unknown>;

/** English source strings passed as literals to t()/tr()/tn(). */
function literalKeys(): { key: string; file: string; plural?: boolean }[] {
  const out: { key: string; file: string; plural?: boolean }[] = [];
  const lit = `'((?:[^'\\\\\\n]|\\\\.)*)'`;
  const single = new RegExp(`\\b(?:t|tr)\\(\\s*${lit}`, 'g');
  const plural = new RegExp(`\\btn\\([^,]+,\\s*${lit}\\s*,\\s*${lit}`, 'g');
  for (const [file, src] of Object.entries(SOURCES)) {
    for (const m of src.matchAll(single)) out.push({ key: m[1].replace(/\\'/g, "'"), file });
    for (const m of src.matchAll(plural)) out.push({ key: m[2].replace(/\\'/g, "'"), file, plural: true });
  }
  return out;
}

describe('Czech translation coverage', () => {
  it('every literal passed to t()/tn() has a Czech entry', () => {
    const missing = literalKeys().filter(({ key, plural }) => {
      if (/^(nav|match)\.[a-zA-Z]+$/.test(key)) return tr(key, {}, 'cs') === tr(key, {}, 'en');
      return plural ? tn(5, key, key, {}, 'cs') === tn(5, key, key, {}, 'en') : tr(key, {}, 'cs') === key;
    });
    // Short brand-like or numeric strings may legitimately stay identical.
    const SAME_IN_CZECH = new Set(['Foil', 'Boss', ', boss', '{n} min', '{xp} / {need} XP', '{name}: {reason}.']);
    const real = missing.filter(({ key }) => /[a-z]{3,}/i.test(key) && !SAME_IN_CZECH.has(key));
    expect(real.map((m) => `${m.file}: ${m.key}`)).toEqual([]);
  });

  it('every menu item and legacy key is translated', () => {
    const keys = ['nav.home', 'nav.play', 'nav.arena', 'nav.campaign', 'nav.collection', 'nav.decks', 'nav.packs', 'nav.shop', 'nav.cardBacks', 'nav.quests', 'nav.profile', 'nav.patchNotes', 'match.endTurn', 'match.enemyTurn', 'match.thinking', 'match.yourTurn', 'match.theirTurn', 'match.concede', 'match.dragHere'];
    expect(keys.filter((k) => tr(k, {}, 'cs') === tr(k, {}, 'en'))).toEqual([]);
  });

  it('every card, talent and keyword has Czech text', () => {
    const cs = Object.assign({}, ...Object.values(CS_CARDS));
    expect(allCards().filter((c) => !cs[c.id]?.name).map((c) => c.id)).toEqual([]);
    const talents = CS_DATA['/src/i18n/cs/data/talents.ts'] as Record<string, unknown>;
    expect([...PLAYABLE_FACTIONS.flatMap((f) => FACTION_TALENTS[f]), ...BOSS_TALENTS].filter((t) => !talents[t.id]).map((t) => t.id)).toEqual([]);
    const kw = CS_DATA['/src/i18n/cs/data/keywords.ts'] as Record<string, unknown>;
    expect(Object.keys(KEYWORDS).filter((k) => !kw[k])).toEqual([]);
  });

  it('every patch note has a Czech version with the same shape', () => {
    const notes = CS_DATA['/src/i18n/cs/data/patchNotes.ts'] as Record<string, { sections?: string[][] }>;
    const bad = PATCH_NOTES.filter((p) => {
      const cs = notes[p.version];
      return !cs?.sections || cs.sections.length !== p.sections.length || cs.sections.some((items, i) => items.length !== p.sections[i].items.length);
    });
    expect(bad.map((p) => p.version)).toEqual([]);
  });
});
