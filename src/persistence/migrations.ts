import { hasCard } from '@/data/cards';
import { STARTER_DECKS, starterDeckCards } from '@/data/starterDecks';
import { PLAYABLE_FACTIONS, VARIANTS } from '@/game/types';
import type { Deck } from '@/domain/decks';
import { CURRENT_SAVE_VERSION, emptyVariants, type GameSave } from '@/domain/save';
import { createNewSave } from '@/domain/newAccount';

export interface MigrationReport {
  save: GameSave;
  fromVersion: number;
  notes: string[];
}

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Ordered migrations: index i upgrades version i -> i+1. */
const MIGRATIONS: ((raw: Raw, notes: string[]) => Raw)[] = [
  // v0 -> v1: early prototype saves without a version.
  (raw) => ({ ...raw, saveVersion: 1 }),
  // v1 -> v2: variant-aware collection ({cardId: n} -> {cardId: {NORMAL, FOIL, PRISMATIC}}).
  (raw, notes) => {
    const cards = raw.collection?.cards ?? {};
    const upgraded: Record<string, unknown> = {};
    for (const [id, v] of Object.entries(cards)) {
      upgraded[id] = typeof v === 'number' ? { ...emptyVariants(), NORMAL: v } : v;
    }
    if (Object.values(cards).some((v) => typeof v === 'number')) notes.push('Collection upgraded to support card variants.');
    return { ...raw, collection: { ...(raw.collection ?? {}), cards: upgraded }, saveVersion: 2 };
  },
  // v2 -> v3: pity timers & daily totals.
  (raw) => ({
    ...raw,
    economy: { packs: {}, pity: {}, ...(raw.economy ?? {}) },
    daily: { nextIndex: 0, lastClaimDay: null, lastClaimAt: 0, totalClaims: 0, ...(raw.daily ?? {}) },
    saveVersion: 3,
  }),
];

const num = (v: unknown, fallback: number, min = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, v) : fallback);

/**
 * Upgrades any older save and repairs invalid data field-by-field with safe
 * defaults. Never throws for bad content; throws only if the save is unusable.
 */
export function migrateSave(input: Raw): MigrationReport {
  const notes: string[] = [];
  let raw: Raw = { ...input };
  const fromVersion = num(raw.saveVersion, 0);
  if (fromVersion > CURRENT_SAVE_VERSION) notes.push('Save is from a newer version; loading what is compatible.');
  for (let v = fromVersion; v < CURRENT_SAVE_VERSION; v++) raw = MIGRATIONS[v](raw, notes);

  if (!raw.profile || typeof raw.profile !== 'object') throw new Error('Save has no player profile');

  const defaults = createNewSave(String(raw.profile.username ?? 'Warden'), String(raw.profile.avatar ?? 'flame'), num(raw.profile.createdAt, Date.now()), String(raw.profile.id ?? 'player'));
  const p = { ...defaults.profile, ...raw.profile };
  p.level = Math.round(num(p.level, 1, 1));
  for (const k of ['xp', 'totalXp', 'gold', 'essence', 'wins', 'losses', 'draws', 'packsOpened', 'cardsCrafted', 'cardsRecycled', 'winsToday'] as const) {
    const fixed = num(p[k], 0);
    if (fixed !== p[k]) notes.push(`Repaired invalid profile value: ${k}.`);
    p[k] = fixed;
  }
  if (!Array.isArray(p.titles)) p.titles = [];

  // Collection: drop unknown cards and invalid counts.
  const cards: GameSave['collection']['cards'] = {};
  for (const [id, v] of Object.entries(raw.collection?.cards ?? {})) {
    if (!hasCard(id)) {
      notes.push(`Removed unknown card from collection: ${id}.`);
      continue;
    }
    const counts = emptyVariants();
    for (const variant of VARIANTS) counts[variant] = Math.floor(num((v as Raw)?.[variant], 0));
    cards[id] = counts;
  }
  const collection = { cards, unseen: Array.isArray(raw.collection?.unseen) ? raw.collection.unseen.filter((id: string) => hasCard(id)) : [] };

  // Decks: keep valid structure, strip unknown cards (deck validation flags size issues in UI).
  let decks: Deck[] = Array.isArray(raw.decks)
    ? raw.decks
        .filter((d: Raw) => d && typeof d === 'object' && typeof d.id === 'string')
        .map((d: Raw) => {
          const deckCards: Record<string, number> = {};
          for (const [id, n] of Object.entries(d.cards ?? {})) {
            if (hasCard(id) && typeof n === 'number' && n > 0) deckCards[id] = Math.floor(n);
            else if (!hasCard(id)) notes.push(`Removed unknown card ${id} from deck "${d.name}".`);
          }
          return {
            id: d.id,
            name: String(d.name ?? 'Deck').slice(0, 40),
            heroFaction: PLAYABLE_FACTIONS.includes(d.heroFaction) ? d.heroFaction : 'EMBER',
            cards: deckCards,
            favorite: !!d.favorite,
            createdAt: num(d.createdAt, Date.now()),
            updatedAt: num(d.updatedAt, Date.now()),
            isStarter: !!d.isStarter,
          } satisfies Deck;
        })
    : [];
  if (decks.length === 0) {
    notes.push('No decks found; starter decks restored.');
    decks = STARTER_DECKS.map((sd) => ({ id: sd.id, name: sd.name, heroFaction: sd.heroFaction, cards: starterDeckCards(sd.heroFaction), favorite: false, createdAt: Date.now(), updatedAt: Date.now(), isStarter: true }));
  }
  if (p.selectedDeckId && !decks.some((d) => d.id === p.selectedDeckId)) p.selectedDeckId = decks[0].id;
  if (p.favoriteDeckId && !decks.some((d) => d.id === p.favoriteDeckId)) p.favoriteDeckId = null;

  const quests = { ...defaults.quests, ...(raw.quests ?? {}) };
  quests.active = Array.isArray(quests.active)
    ? quests.active
        .filter((q: Raw) => q && typeof q.id === 'string')
        .map((q: Raw) => ({ ...q, target: num(q.target, 1, 1), progress: Math.min(num(q.progress, 0), num(q.target, 1, 1)) }))
    : [];

  const save: GameSave = {
    saveVersion: CURRENT_SAVE_VERSION,
    profile: p,
    collection,
    decks,
    economy: { packs: { ...(raw.economy?.packs ?? {}) }, pity: { ...(raw.economy?.pity ?? {}) } },
    quests,
    daily: { ...defaults.daily, ...(raw.daily ?? {}) },
    pve: { completed: { ...(raw.pve?.completed ?? {}) } },
    matchHistory: Array.isArray(raw.matchHistory) ? raw.matchHistory.slice(0, 100) : [],
    recentRewards: Array.isArray(raw.recentRewards) ? raw.recentRewards.slice(0, 20) : [],
  };
  for (const [k, v] of Object.entries(save.economy.packs)) save.economy.packs[k as keyof typeof save.economy.packs] = Math.floor(num(v, 0));
  return { save, fromVersion, notes };
}
