import { create } from 'zustand';
import { LATEST_PATCH } from '@/data/patchNotes';

const KEY = 'shardbound.patchSeen';

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Whether the player has read the latest patch notes (per browser). */
export const usePatchNotesSeen = create<{ seen: boolean }>(() => ({ seen: read() === LATEST_PATCH }));

export function markPatchNotesSeen() {
  try {
    localStorage.setItem(KEY, LATEST_PATCH);
  } catch {
    /* ignore */
  }
  usePatchNotesSeen.setState({ seen: true });
}
