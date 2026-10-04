import { titlesUpTo } from '@/config/progression';
import { repairArena } from '@/domain/arena';
import { repairActiveMatch } from '@/domain/activeMatch';
import { hasCard } from '@/data/cards';
import { STARTER_DECKS, starterDeckCards } from '@/data/starterDecks';
import { PLAYABLE_FACTIONS, VARIANTS, type PlayableFaction } from '@/game/types';
import { defaultBuild, isWellFormedBuild, type TalentPick } from '@/data/wardenTalents';
import { DEFAULT_CARD_BACK, getCardBack } from '@/data/cardBacks';
import { getPortrait } from '@/data/portraits';
import { DEFAULT_PORTRAIT } from '@/domain/portraits';
import type { Deck } from '@/domain/decks';
import { CURRENT_SAVE_VERSION, emptyVariants, type GameSave } from '@/domain/save';
import { createNewSave } from '@/domain/newAccount';
import { newRanked } from '@/domain/ranked';
import { repairAiRanked } from '@/domain/aiRanked';

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
  // v3 -> v4: redeem codes.
  (raw) => ({ ...raw, redeemedCodes: Array.isArray(raw.redeemedCodes) ? raw.redeemedCodes : [], saveVersion: 4 }),
  // v4 -> v5: ranked ladder.
  (raw) => ({
    ...raw,
    // Only a real profile object is upgraded; anything else stays invalid and is reported as corrupted.
    profile: raw.profile && typeof raw.profile === 'object' ? { ...raw.profile, ranked: raw.profile.ranked ?? newRanked() } : raw.profile,
    saveVersion: 5,
  }),
];

const num = (v: unknown, fallback: number, min = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, v) : fallback);

/**
 * Upgrades any older save and repairs invalid data field-by-field with safe
 * defaults. Never throws for bad content; throws only if the save is unusable.
 */
/** Keeps any build the talent tree could have made (unfinished ones too); anything else becomes the default. */
function repairTalents(faction: PlayableFaction, raw: unknown, deckName: string, notes: string[]): TalentPick[] {
  if (isWellFormedBuild(faction, raw)) return raw.map((t) => ({ abilityId: t.abilityId, level: t.level }));
  if (raw !== undefined) notes.push(`Reset the Warden talents of deck "${deckName}" to the default build.`);
  return defaultBuild(faction);
}

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
  // Titles moved from every 10 to every 5 levels: grant the ones already passed.
  p.titles = [...new Set([...p.titles, ...titlesUpTo(p.level)])];
  // Card backs: keep known ones, always own the default, and only use an owned one.
  const backs = Array.isArray(p.cardBacks) ? p.cardBacks.filter((b: unknown) => typeof b === 'string' && getCardBack(b)) : [];
  p.cardBacks = [DEFAULT_CARD_BACK, ...new Set(backs.filter((b: string) => b !== DEFAULT_CARD_BACK))];
  if (!p.cardBacks.includes(p.cardBack)) p.cardBack = DEFAULT_CARD_BACK;
  // Portraits: keep known ones; a faction choice must be an owned portrait of that faction.
  p.portraits = Array.isArray(p.portraits) ? [...new Set(p.portraits.filter((id: unknown) => typeof id === 'string' && getPortrait(id)))] : [];
  const fp: Record<string, string> = {};
  for (const [f, id] of Object.entries(p.factionPortraits && typeof p.factionPortraits === 'object' ? p.factionPortraits : {})) {
    if (typeof id === 'string' && getPortrait(id)?.faction === f && p.portraits.includes(id)) fp[f] = id;
  }
  p.factionPortraits = fp;
  p.activeMatch = repairActiveMatch(p.activeMatch);
  p.bundlesBought = Array.isArray(p.bundlesBought) ? p.bundlesBought.filter((id: unknown) => typeof id === 'string') : [];
  const r = p.ranked && typeof p.ranked === 'object' ? p.ranked : newRanked();
  p.ranked = { rating: num(r.rating, 1000, 100), peak: num(r.peak, 1000, 100), wins: Math.floor(num(r.wins, 0)), losses: Math.floor(num(r.losses, 0)) };
  p.aiRanked = repairAiRanked(p.aiRanked);

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
          const heroFaction: PlayableFaction = PLAYABLE_FACTIONS.includes(d.heroFaction) ? d.heroFaction : 'EMBER';
          return {
            id: d.id,
            name: String(d.name ?? 'Deck').slice(0, 40),
            heroFaction,
            cards: deckCards,
            talents: repairTalents(heroFaction, d.talents, String(d.name ?? 'Deck'), notes),
            favorite: !!d.favorite,
            createdAt: num(d.createdAt, Date.now()),
            updatedAt: num(d.updatedAt, Date.now()),
            isStarter: !!d.isStarter,
            // Per-deck portrait: the faction default, or an owned portrait of the deck's faction.
            ...(d.portrait === DEFAULT_PORTRAIT || (typeof d.portrait === 'string' && getPortrait(d.portrait)?.faction === heroFaction && p.portraits.includes(d.portrait)) ? { portrait: d.portrait as string } : {}),
          } satisfies Deck;
        })
    : [];
  if (decks.length === 0) {
    notes.push('No decks found; starter decks restored.');
    decks = STARTER_DECKS.map((sd) => ({ id: sd.id, name: sd.name, heroFaction: sd.heroFaction, cards: starterDeckCards(sd.heroFaction), talents: defaultBuild(sd.heroFaction), favorite: false, createdAt: Date.now(), updatedAt: Date.now(), isStarter: true }));
  }
  if (p.selectedDeckId && !decks.some((d) => d.id === p.selectedDeckId)) p.selectedDeckId = decks[0].id;
  if (p.favoriteDeckId && !decks.some((d) => d.id === p.favoriteDeckId)) p.favoriteDeckId = null;

  const quests = { ...defaults.quests, ...(raw.quests ?? {}) };
  quests.active = Array.isArray(quests.active)
    ? quests.active
        .filter((q: Raw) => q && typeof q.id === 'string')
        .map((q: Raw) => ({ ...q, target: num(q.target, 1, 1), progress: Math.min(num(q.progress, 0), num(q.target, 1, 1)) }))
    : [];
  const w = quests.weekly as Raw;
  quests.weekly = w && typeof w === 'object' && typeof w.id === 'string' ? { ...w, target: num(w.target, 1, 1), progress: Math.min(num(w.progress, 0), num(w.target, 1, 1)) } : null;
  if (typeof quests.weekKey !== 'string') quests.weekKey = null;

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
    arena: repairArena(raw.arena),
    redeemedCodes: Array.isArray(raw.redeemedCodes) ? raw.redeemedCodes.filter((c: unknown) => typeof c === 'string') : [],
  };
  for (const [k, v] of Object.entries(save.economy.packs)) save.economy.packs[k as keyof typeof save.economy.packs] = Math.floor(num(v, 0));
  return { save, fromVersion, notes };
}
