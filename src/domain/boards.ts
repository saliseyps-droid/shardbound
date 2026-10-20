import { err, ok, type Result } from '@/core/utils';
import type { GameSave, PlayerProfile } from './save';

/**
 * Game boards: every play-mat comes alive in matches (src/ui/match/AnimatedBoard.tsx, src/ui/match/boardFx.ts).
 * In Customization you can pick one to play on in every match that has no mats of its own (the
 * Wraithwood Inn, the Underflame and the Twin Oath keep theirs), or leave it random. The general mats
 * are yours from the start; a campaign's own tables are earned by beating its final boss. Only you see
 * your board: an online opponent plays on their own.
 */
export interface BoardDef {
  /** The mat's file name (src/assets/boards/<id>.webp). */
  id: string;
  name: string;
  /** The encounter whose first win earns the board; none for the general mats. */
  unlockEncounter?: string;
  /** What earns it, for the locked tile. */
  unlockText?: string;
}

const INN = { unlockEncounter: 'w4_boss', unlockText: 'Defeat the Hollow Host in The Wraithwood Inn to earn it.' };
const INFERNO = { unlockEncounter: 'u4_boss', unlockText: 'Defeat Azgaroth at the bottom of The Underflame to earn it.' };

export const BOARDS: BoardDef[] = [
  { id: 'board-1', name: 'Arcane Sigil' },
  { id: 'board-2', name: 'Void Prism' },
  { id: 'board-3', name: 'Sapphire Court' },
  { id: 'board-4', name: 'Emerald Hall' },
  { id: 'board-5', name: 'Candlelit Mosaic' },
  { id: 'board-6', name: 'Deep Grove' },
  { id: 'board-7', name: 'Butterfly Garden' },
  { id: 'board-8', name: 'Castle Tapestry' },
  { id: 'board-9', name: 'Lava Rift' },
  { id: 'board-10', name: 'Frozen Lake' },
  { id: 'inn-board-1', name: 'The Tankard Table', ...INN },
  { id: 'inn-board-2', name: 'The Teacup Table', ...INN },
  { id: 'inferno-board-1', name: 'The Burning Throne', ...INFERNO },
  { id: 'inferno-board-2', name: 'The Infernal Altar', ...INFERNO },
  { id: 'heaven-board-1', name: 'The Host’s Firmament', unlockEncounter: 'hv3_final', unlockText: 'Defeat the Arbiter in The Twin Oath to earn it.' },
];

export const getBoard = (id: unknown): BoardDef | undefined => BOARDS.find((b) => b.id === id);

export function boardOwnedBy(save: Pick<GameSave, 'pve'>, id: unknown): boolean {
  const def = getBoard(id);
  return !!def && (!def.unlockEncounter || !!save.pve.completed[def.unlockEncounter]);
}

/** The board to play on: the chosen one while you still have it, else null (a random mat). */
export function activeBoard(save: Pick<GameSave, 'pve'> & { profile: Pick<PlayerProfile, 'board'> }): string | null {
  const b = save.profile.board;
  return b && boardOwnedBy(save, b) ? b : null;
}

export function chooseBoard(save: GameSave, id: string | null): Result<GameSave> {
  if (id !== null && !getBoard(id)) return err('Unknown board.');
  if (id !== null && !boardOwnedBy(save, id)) return err(getBoard(id)!.unlockText ?? 'Unknown board.');
  return ok({ ...save, profile: { ...save.profile, board: id } });
}
