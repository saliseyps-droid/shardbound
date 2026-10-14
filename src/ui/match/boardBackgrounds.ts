/** Play-mat artwork for the match board (src/assets/boards/board-*.webp, inn-board-*.webp). */
const modules = import.meta.glob('../../assets/boards/board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const innModules = import.meta.glob('../../assets/boards/inn-board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byNumber = (a: string, b: string) => Number(a.match(/(\d+)\.webp$/)?.[1]) - Number(b.match(/(\d+)\.webp$/)?.[1]);

export const BOARD_BACKGROUNDS: string[] = Object.keys(modules)
  .sort(byNumber)
  .map((k) => modules[k]);
/** The Wraithwood Inn's own tavern tables: its campaign fights use only these, taking turns. */
export const INN_BOARDS: string[] = Object.keys(innModules)
  .sort(byNumber)
  .map((k) => innModules[k]);

/** How much the dark veil over the mat hides it (0.5 by default); the dark fire and ice mats get a lighter one. */
const DIM: Record<string, number> = { 'board-9': 0.28, 'board-10': 0.3 };
const dimOf = (url: string) => {
  const key = Object.keys(DIM).find((k) => new RegExp(`/${k}[.-]`).test(url));
  return key ? DIM[key] : 0.5;
};

export interface BoardBackground {
  url: string;
  /** Opacity of the dark veil over it. */
  dim: number;
}

const KEY = 'shardbound.lastBoard';
const INN_KEY = 'shardbound.lastInnBoard';

function readIndex(key: string): number {
  try {
    return Number(localStorage.getItem(key) ?? -1);
  } catch {
    return -1;
  }
}
function writeIndex(key: string, i: number) {
  try {
    localStorage.setItem(key, String(i));
  } catch {
    /* ignore */
  }
}

/**
 * Picks the board: a Wraithwood Inn fight alternates between the two tavern tables; any other
 * match gets a random board, never the same one as the previous match (also across reloads).
 */
export function pickBoardBackground(opts: { inn?: boolean } = {}): BoardBackground | null {
  if (opts.inn && INN_BOARDS.length > 0) {
    const i = (readIndex(INN_KEY) + 1 + INN_BOARDS.length) % INN_BOARDS.length;
    writeIndex(INN_KEY, i);
    return { url: INN_BOARDS[i], dim: dimOf(INN_BOARDS[i]) };
  }
  const n = BOARD_BACKGROUNDS.length;
  if (n === 0) return null;
  const last = readIndex(KEY);
  let i = Math.floor(Math.random() * n);
  if (n > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
  writeIndex(KEY, i);
  return { url: BOARD_BACKGROUNDS[i], dim: dimOf(BOARD_BACKGROUNDS[i]) };
}
