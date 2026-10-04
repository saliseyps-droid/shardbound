import { err, ok, type Result } from '@/core/utils';
import { getCard } from '@/data/cards';
import { defaultBuild, isWellFormedBuild, type TalentPick } from '@/data/wardenTalents';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { DECK_RULES } from '@/config/gameRules';
import { maxCopiesFor, type Deck } from './decks';

/**
 * Shareable deck codes: "SB1." + base64url(JSON). Short enough to paste in a chat,
 * and versioned so the format can change later without breaking old codes.
 */
const PREFIX = 'SB1.';

interface Payload {
  n: string;
  f: string;
  c: [string, number][];
  t?: [string, number][];
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
}

export function encodeDeck(deck: Pick<Deck, 'name' | 'heroFaction' | 'cards' | 'talents'>): string {
  const payload: Payload = {
    n: deck.name,
    f: deck.heroFaction,
    c: Object.entries(deck.cards).filter(([, n]) => n > 0).sort(([a], [b]) => a.localeCompare(b)),
    t: deck.talents.map((p) => [p.abilityId, p.level]),
  };
  return PREFIX + toBase64Url(JSON.stringify(payload));
}

export interface DecodedDeck {
  name: string;
  heroFaction: PlayableFaction;
  cards: Record<string, number>;
  talents: TalentPick[];
  /** Card ids in the code that this version of the game does not know. */
  unknownCards: string[];
}

const DAMAGED = 'That deck code is damaged. Copy it again.';

export function decodeDeck(input: string): Result<DecodedDeck> {
  // Any malformed content is a damaged code, never an exception.
  try {
    return decodeUnsafe(input);
  } catch {
    return err(DAMAGED);
  }
}

function decodeUnsafe(input: string): Result<DecodedDeck> {
  if (typeof input !== 'string') return err('That is not a deck code.');
  const code = input.trim();
  if (!code.startsWith(PREFIX)) return err('That is not a deck code.');
  let payload: Payload;
  try {
    payload = JSON.parse(fromBase64Url(code.slice(PREFIX.length)));
  } catch {
    return err('That deck code is damaged. Copy it again.');
  }
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.c)) return err('That deck code is damaged. Copy it again.');
  const faction = payload.f as PlayableFaction;
  if (!(PLAYABLE_FACTIONS as readonly string[]).includes(faction)) return err('That deck code is damaged. Copy it again.');
  const cards: Record<string, number> = {};
  const unknownCards: string[] = [];
  for (const entry of payload.c) {
    if (!Array.isArray(entry)) continue;
    const [id, n] = entry;
    const card = typeof id === 'string' ? getCard(id) : undefined;
    if (!card || !card.collectible) {
      if (typeof id === 'string') unknownCards.push(id);
      continue;
    }
    const count = Math.min(Math.floor(Number(n) || 0), maxCopiesFor(card));
    if (count > 0) cards[id] = count;
  }
  const rawTalents: unknown = payload.t ?? [];
  const talents = (Array.isArray(rawTalents) ? rawTalents : [])
    .filter((p): p is [unknown, unknown] => Array.isArray(p) && p.length >= 2)
    .map(([abilityId, level]) => ({ abilityId, level })) as TalentPick[];
  const name = (typeof payload.n === 'string' ? payload.n : '').trim().slice(0, DECK_RULES.maxDeckNameLength) || 'Imported deck';
  return ok({ name, heroFaction: faction, cards, talents: isWellFormedBuild(faction, talents) ? talents : defaultBuild(faction), unknownCards });
}
