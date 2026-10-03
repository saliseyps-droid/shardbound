import { err, ok, type Result } from '@/core/utils';
import { getPortrait } from '@/data/portraits';
import type { PlayableFaction } from '@/game/types';
import type { Deck } from './decks';
import { pushReward, type GameSave, type PlayerProfile } from './save';

/** Deck setting that forces the faction's default portrait even when the Profile picks another. */
export const DEFAULT_PORTRAIT = 'default';

export function buyPortrait(save: GameSave, id: string, now: number): Result<GameSave> {
  const p = getPortrait(id);
  if (!p) return err('This portrait is not available.');
  if (save.profile.portraits.includes(id)) return err('You already own this portrait.');
  if (save.profile.gold < p.price) return err('Not enough Gold.');
  const next: GameSave = { ...save, profile: { ...save.profile, gold: save.profile.gold - p.price, portraits: [...save.profile.portraits, id] } };
  return ok(pushReward(next, { source: `Purchased the ${p.name} portrait` }, now));
}

/** The portrait for every deck of a faction (null = the faction's default Warden). */
export function choosePortrait(save: GameSave, faction: PlayableFaction, id: string | null): Result<GameSave> {
  const factionPortraits = { ...save.profile.factionPortraits };
  if (id === null) delete factionPortraits[faction];
  else {
    const p = getPortrait(id);
    if (!p || p.faction !== faction) return err('This portrait belongs to another faction.');
    if (!save.profile.portraits.includes(id)) return err('You do not own this portrait yet.');
    factionPortraits[faction] = id;
  }
  return ok({ ...save, profile: { ...save.profile, factionPortraits } });
}

/** Portrait a deck shows: its own choice if valid, else the Profile's choice for its faction, else the default (null). */
export function effectivePortrait(deck: Pick<Deck, 'heroFaction' | 'portrait'>, profile: Pick<PlayerProfile, 'portraits' | 'factionPortraits'>): string | null {
  const usable = (id: string | null | undefined) => {
    const p = getPortrait(id);
    return !!p && p.faction === deck.heroFaction && profile.portraits.includes(p.id);
  };
  if (deck.portrait === DEFAULT_PORTRAIT) return null;
  if (usable(deck.portrait)) return deck.portrait!;
  const chosen = profile.factionPortraits[deck.heroFaction];
  return usable(chosen) ? chosen! : null;
}
