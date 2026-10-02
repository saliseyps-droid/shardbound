import { DECK_RULES } from '@/config/gameRules';
import { FACTIONS } from '@/data/factions';
import { collectibleCards, getCard } from '@/data/cards';
import type { CardDefinition, Faction, PlayableFaction } from '@/game/types';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { createRng, nextFloat } from '@/core/rng';
import { hashString } from '@/core/rng';
import { validateBuild, type TalentPick } from '@/data/wardenTalents';

export interface Deck {
  id: string;
  name: string;
  heroFaction: PlayableFaction;
  /** cardId -> copies */
  cards: Record<string, number>;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  /** Starter decks can't be deleted accidentally; they can be edited. */
  isStarter?: boolean;
  /** Warden talent build: 2 abilities, one at rank III and one at rank II. */
  talents: TalentPick[];
}

export type DeckIssueCode =
  | 'SIZE'
  | 'COPIES'
  | 'LEGENDARY_COPIES'
  | 'FACTIONS'
  | 'HERO_FACTION'
  | 'UNKNOWN_CARD'
  | 'NOT_OWNED'
  | 'NOT_COLLECTIBLE'
  | 'NAME'
  | 'TALENTS';

export interface DeckIssue {
  code: DeckIssueCode;
  message: string;
  cardId?: string;
}

export function deckSize(deck: Pick<Deck, 'cards'>): number {
  return Object.values(deck.cards).reduce((a, b) => a + b, 0);
}

export function maxCopiesFor(card: CardDefinition): number {
  return card.rarity === 'LEGENDARY' ? DECK_RULES.maxLegendaryCopies : DECK_RULES.maxCopies;
}

export function deckFactions(deck: Pick<Deck, 'cards'>): Faction[] {
  const set = new Set<Faction>();
  for (const id of Object.keys(deck.cards)) {
    const c = getCard(id);
    if (c && c.faction !== 'NEUTRAL' && deck.cards[id] > 0) set.add(c.faction);
  }
  return [...set];
}

/**
 * Validates a deck against the game rules and (optionally) the owner's collection.
 * @param owned cardId -> owned copies across all variants
 */
export function validateDeck(deck: Pick<Deck, 'cards' | 'heroFaction' | 'name'> & { talents?: TalentPick[] }, owned?: (cardId: string) => number): DeckIssue[] {
  const issues: DeckIssue[] = [];
  // Card-list-only checks (online decks) pass no talents.
  if ('talents' in deck && validateBuild(deck.heroFaction, deck.talents) !== null) {
    issues.push({ code: 'TALENTS', message: 'Choose 2 Warden abilities and spend all 5 talent points.' });
  }
  const size = deckSize(deck);
  if (size !== DECK_RULES.deckSize) issues.push({ code: 'SIZE', message: `${size} / ${DECK_RULES.deckSize} cards` });
  if (!deck.name?.trim()) issues.push({ code: 'NAME', message: 'Deck needs a name.' });

  for (const [id, count] of Object.entries(deck.cards)) {
    if (count <= 0) continue;
    const card = getCard(id);
    if (!card) {
      issues.push({ code: 'UNKNOWN_CARD', message: `Unknown card "${id}" will be removed.`, cardId: id });
      continue;
    }
    if (!card.collectible) issues.push({ code: 'NOT_COLLECTIBLE', message: `${card.name} cannot be put in decks.`, cardId: id });
    const max = maxCopiesFor(card);
    if (count > max) {
      issues.push(
        card.rarity === 'LEGENDARY'
          ? { code: 'LEGENDARY_COPIES', message: `Legendary limit exceeded: ${card.name} (max ${max}).`, cardId: id }
          : { code: 'COPIES', message: `Deck cannot contain more than ${max} copies of ${card.name}.`, cardId: id },
      );
    }
    if (owned && owned(id) < count) {
      issues.push({ code: 'NOT_OWNED', message: `You own ${owned(id)} of ${count} ${card.name}.`, cardId: id });
    }
  }

  // Only the Warden faction and Neutral cards are allowed.
  const foreign = deckFactions(deck).filter((f) => f !== deck.heroFaction);
  if (foreign.length > 0) {
    issues.push({ code: 'FACTIONS', message: `Invalid faction: only ${FACTIONS[deck.heroFaction].name} and Neutral cards are allowed (remove ${foreign.map((f) => FACTIONS[f].name).join(', ')} cards).` });
  }
  return issues;
}

export function isDeckPlayable(deck: Deck, owned?: (cardId: string) => number): boolean {
  return validateDeck(deck, owned).length === 0;
}

export function deckToList(deck: Pick<Deck, 'cards'>): string[] {
  const list: string[] = [];
  for (const [id, n] of Object.entries(deck.cards)) for (let i = 0; i < n; i++) list.push(id);
  return list;
}

/** Can this card be added to the deck right now? Returns a reason when not. */
export function canAddCard(deck: Deck, cardId: string, ownedCopies: number | null): string | null {
  const card = getCard(cardId);
  if (!card || !card.collectible) return 'Card unavailable';
  if (deckSize(deck) >= DECK_RULES.deckSize) return 'Deck is full';
  const inDeck = deck.cards[cardId] ?? 0;
  if (inDeck >= maxCopiesFor(card)) return card.rarity === 'LEGENDARY' ? 'Legendary limit reached' : `Max ${DECK_RULES.maxCopies} copies`;
  if (ownedCopies !== null && inDeck >= ownedCopies) return 'Not enough copies owned';
  if (card.faction !== 'NEUTRAL' && card.faction !== deck.heroFaction) return `Only ${FACTIONS[deck.heroFaction].name} and Neutral cards`;
  return null;
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export interface DeckStats {
  curve: number[]; // index = cost (7 = 7+)
  types: Record<string, number>;
  rarities: Record<string, number>;
  factions: Record<string, number>;
  averageCost: number;
}

export function deckStats(deck: Pick<Deck, 'cards'>): DeckStats {
  const curve = Array.from({ length: 8 }, () => 0);
  const types: Record<string, number> = {};
  const rarities: Record<string, number> = {};
  const factions: Record<string, number> = {};
  let totalCost = 0;
  let n = 0;
  for (const [id, count] of Object.entries(deck.cards)) {
    const c = getCard(id);
    if (!c || count <= 0) continue;
    curve[Math.min(7, c.manaCost)] += count;
    types[c.cardType] = (types[c.cardType] ?? 0) + count;
    rarities[c.rarity] = (rarities[c.rarity] ?? 0) + count;
    factions[c.faction] = (factions[c.faction] ?? 0) + count;
    totalCost += c.manaCost * count;
    n += count;
  }
  return { curve, types, rarities, factions, averageCost: n ? totalCost / n : 0 };
}

// ---------------------------------------------------------------------------
// Automatic deck building (bots, starter decks, "auto-complete")
// ---------------------------------------------------------------------------

/** Target number of cards per cost bucket for a 30-card deck. */
const CURVE_TARGET = [1, 4, 6, 6, 5, 4, 2, 2];

function cardScore(card: CardDefinition, archetype?: string): number {
  const rarityBonus = { COMMON: 0, RARE: 1, EPIC: 1.8, LEGENDARY: 2.6 }[card.rarity];
  let score = 3 + rarityBonus;
  if (archetype && card.archetypes?.includes(archetype)) score += 3;
  if (card.cardType === 'UNIT') score += 1;
  return score;
}

export interface AutoBuildOptions {
  heroFaction: PlayableFaction;
  secondFaction?: Faction | null;
  archetype?: string;
  /** Owned copies per card; null = unlimited pool (bots). */
  owned?: ((cardId: string) => number) | null;
  /** Cards to keep (existing deck contents). */
  base?: Record<string, number>;
  seed?: number;
  /** Maximum rarity strength for easy bots (e.g. only commons+rares). */
  allowedRarities?: CardDefinition['rarity'][];
}

/** Fills a deck to 30 cards honouring the curve, faction rules and ownership. */
export function autoBuildDeck(opts: AutoBuildOptions): Record<string, number> {
  const rng = createRng(opts.seed ?? hashString(opts.heroFaction + (opts.archetype ?? '')));
  const cards: Record<string, number> = { ...(opts.base ?? {}) };
  const factions = new Set<Faction>([opts.heroFaction, 'NEUTRAL']);
  if (opts.secondFaction) factions.add(opts.secondFaction);
  const pool = collectibleCards().filter(
    (c) => factions.has(c.faction) && (!opts.allowedRarities || opts.allowedRarities.includes(c.rarity)),
  );
  const available = (c: CardDefinition) => {
    const ownedN = opts.owned ? opts.owned(c.id) : Infinity;
    return Math.min(ownedN, maxCopiesFor(c)) - (cards[c.id] ?? 0);
  };
  const curve = deckStats({ cards }).curve;
  const size = () => deckSize({ cards });
  const factionBias = (c: CardDefinition) => (c.faction === opts.heroFaction ? 1.5 : c.faction === 'NEUTRAL' ? 0 : 0.8);

  let guard = 0;
  while (size() < DECK_RULES.deckSize && guard++ < 500) {
    const candidates = pool.filter((c) => available(c) > 0);
    if (candidates.length === 0) break;
    let best: CardDefinition | null = null;
    let bestScore = -Infinity;
    for (const c of candidates) {
      const bucket = Math.min(7, c.manaCost);
      const need = CURVE_TARGET[bucket] - curve[bucket];
      const score = cardScore(c, opts.archetype) + factionBias(c) + need * 1.6 + nextFloat(rng) * 1.5;
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (!best) break;
    cards[best.id] = (cards[best.id] ?? 0) + 1;
    curve[Math.min(7, best.manaCost)]++;
  }
  return cards;
}

export function factionOfList(list: string[]): PlayableFaction {
  const counts = new Map<PlayableFaction, number>();
  for (const id of list) {
    const f = getCard(id)?.faction;
    if (f && f !== 'NEUTRAL') counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  let best: PlayableFaction = PLAYABLE_FACTIONS[0];
  let n = -1;
  for (const [f, c] of counts) if (c > n) [best, n] = [f, c];
  return best;
}
