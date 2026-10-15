import { err, ok, type Result } from '@/core/utils';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import type { GameSave } from './save';

/**
 * Warden frames (src/ui/components/WardenFrame.tsx): one per faction, earned with that many wins
 * with the faction. The chosen frame shows around your Warden in matches (also to online
 * opponents), on Home and in the Profile; any earned frame goes with any deck.
 */
export const FRAME_WINS = 100;

export const isFrameFaction = (v: unknown): v is PlayableFaction => typeof v === 'string' && (PLAYABLE_FACTIONS as readonly string[]).includes(v);

export function frameUnlocked(save: GameSave, f: PlayableFaction): boolean {
  return (save.profile.factionWins[f] ?? 0) >= FRAME_WINS;
}

/** The frame to show: the chosen one while it is still earned. */
export function activeFrame(save: GameSave): PlayableFaction | null {
  const f = save.profile.wardenFrame;
  return isFrameFaction(f) && frameUnlocked(save, f) ? f : null;
}

export function chooseFrame(save: GameSave, f: PlayableFaction | null): Result<GameSave> {
  if (f !== null && !isFrameFaction(f)) return err('Unknown frame.');
  if (f !== null && !frameUnlocked(save, f)) return err('Win {n} matches with this faction to earn its frame.');
  return ok({ ...save, profile: { ...save.profile, wardenFrame: f } });
}
