/** Play-mat artwork for the match board (src/assets/boards/board-*.webp). */
const modules = import.meta.glob('../../assets/boards/board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const BOARD_BACKGROUNDS: string[] = Object.keys(modules)
  .sort()
  .map((k) => modules[k]);

const KEY = 'shardbound.lastBoard';

/** Picks a random board, never the same one as the previous match (also across reloads). */
export function pickBoardBackground(): string | null {
  const n = BOARD_BACKGROUNDS.length;
  if (n === 0) return null;
  let last = -1;
  try {
    last = Number(localStorage.getItem(KEY) ?? -1);
  } catch {
    /* storage unavailable */
  }
  let i = Math.floor(Math.random() * n);
  if (n > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
  try {
    localStorage.setItem(KEY, String(i));
  } catch {
    /* ignore */
  }
  return BOARD_BACKGROUNDS[i];
}
