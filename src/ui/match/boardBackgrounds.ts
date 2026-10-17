/** Play-mat artwork for the match board (src/assets/boards/board-*.webp, inn-board-*.webp, inferno-board-*.webp, heaven-board-*.webp). */
const modules = import.meta.glob('../../assets/boards/board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const innModules = import.meta.glob('../../assets/boards/inn-board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const infernoModules = import.meta.glob('../../assets/boards/inferno-board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const heavenModules = import.meta.glob('../../assets/boards/heaven-board-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const byNumber = (a: string, b: string) => Number(a.match(/(\d+)\.webp$/)?.[1]) - Number(b.match(/(\d+)\.webp$/)?.[1]);
const sorted = (m: Record<string, string>) =>
  Object.keys(m)
    .sort(byNumber)
    .map((k) => m[k]);

/** The general mats. */
export const BOARD_BACKGROUNDS: string[] = sorted(modules);
/** The Wraithwood Inn's own tavern tables: its campaign fights use only these, taking turns. */
export const INN_BOARDS: string[] = sorted(innModules);
/** The Underflame's hellish tables: its campaign fights use only these, taking turns. */
export const INFERNO_BOARDS: string[] = sorted(infernoModules);
/** Mats that belong to one campaign: its fights take turns on them, other campaigns never get them. */
/** The Twin Oath's starry table of the Host: every one of its fights is played on it. */
export const HEAVEN_BOARDS: string[] = sorted(heavenModules);
const CAMPAIGN_BOARDS: Record<string, string[]> = { inn: INN_BOARDS, inferno: INFERNO_BOARDS, heaven: HEAVEN_BOARDS };

/** How much the dark veil over the mat hides it (0.5 by default); the dark fire and ice mats get a lighter one. */
const DIM: Record<string, number> = { 'board-9': 0.28, 'board-10': 0.3, 'inferno-board-1': 0.42, 'inferno-board-2': 0.42, 'heaven-board-1': 0.38 };
const dimOf = (url: string) => {
  const key = Object.keys(DIM)
    .sort((a, b) => b.length - a.length)
    .find((k) => new RegExp(`/${k}[.-]`).test(url));
  return key ? DIM[key] : 0.5;
};

export interface BoardBackground {
  url: string;
  /** Opacity of the dark veil over it. */
  dim: number;
}

const KEY = 'shardbound.lastBoard';
const CAMPAIGN_KEY = (c: string) => (c === 'inn' ? 'shardbound.lastInnBoard' : `shardbound.lastBoard.${c}`);

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
 * Picks the board.
 * - A fight in a campaign with its own mats (the Wraithwood Inn, the Underflame, the Twin Oath) takes turns on those.
 * - A fight in any other campaign gets one of the general mats.
 * - Any other match (practice, ranked, online…) gets any mat, the campaign ones included.
 * A random pick is never the same as the previous match's (also across reloads).
 */
export function pickBoardBackground(opts: { campaign?: string | null } = {}): BoardBackground | null {
  const own = opts.campaign ? CAMPAIGN_BOARDS[opts.campaign] : undefined;
  if (own && own.length > 0) {
    const key = CAMPAIGN_KEY(opts.campaign!);
    const i = (readIndex(key) + 1 + own.length) % own.length;
    writeIndex(key, i);
    return { url: own[i], dim: dimOf(own[i]) };
  }
  const pool = opts.campaign ? BOARD_BACKGROUNDS : [...BOARD_BACKGROUNDS, ...INN_BOARDS, ...INFERNO_BOARDS, ...HEAVEN_BOARDS];
  const n = pool.length;
  if (n === 0) return null;
  const last = readIndex(KEY);
  let i = Math.floor(Math.random() * n);
  if (n > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
  writeIndex(KEY, i);
  return { url: pool[i], dim: dimOf(pool[i]) };
}
