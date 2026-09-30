import { CAMPAIGN, type OpponentDef } from '@/data/opponents';
import type { GameSave } from '@/domain/save';

/** An encounter unlocks when the previous one (across chapters) has been cleared. */
export function isUnlocked(save: GameSave, encounterId: string): boolean {
  const flat = CAMPAIGN.flatMap((c) => c.encounters);
  const idx = flat.findIndex((e) => e.id === encounterId);
  if (idx <= 0) return true;
  return !!save.pve.completed[flat[idx - 1].id];
}

export function isCleared(save: GameSave, encounterId: string): boolean {
  return !!save.pve.completed[encounterId];
}

export function nextEncounter(save: GameSave): { encounter: OpponentDef; chapterIndex: number } | null {
  for (let c = 0; c < CAMPAIGN.length; c++) {
    for (const e of CAMPAIGN[c].encounters) if (!isCleared(save, e.id)) return { encounter: e, chapterIndex: c };
  }
  return null;
}

export function campaignProgress(save: GameSave) {
  const flat = CAMPAIGN.flatMap((c) => c.encounters);
  const cleared = flat.filter((e) => isCleared(save, e.id)).length;
  return { cleared, total: flat.length };
}
