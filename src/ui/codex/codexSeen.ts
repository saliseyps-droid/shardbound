import { create } from 'zustand';

/**
 * Which Codex pages the player has already looked at (per account, per browser). Pages written
 * since then light a dot on the Codex menu item and are marked "New" in the book. The first time an
 * account is seen here, everything already written counts as read, so old players get no flood.
 */
const key = (account: string) => `shardbound.codexSeen:${account}`;

function read(account: string): string[] | null {
  try {
    const raw = localStorage.getItem(key(account));
    const v = raw ? JSON.parse(raw) : null;
    return Array.isArray(v) ? v.filter((id): id is string => typeof id === 'string') : null;
  } catch {
    return null;
  }
}

function write(account: string, ids: string[]) {
  try {
    localStorage.setItem(key(account), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export const useCodexSeen = create<{ account: string | null; seen: string[] }>(() => ({ account: null, seen: [] }));

/** Loads the read pages of this account; a first visit counts every open page as read. */
export function syncCodexSeen(account: string, open: string[]) {
  if (useCodexSeen.getState().account === account) return;
  let seen = read(account);
  if (!seen) {
    seen = open;
    write(account, seen);
  }
  useCodexSeen.setState({ account, seen });
}

/** Marks these pages as read. */
export function markCodexSeen(ids: string[]) {
  const { account, seen } = useCodexSeen.getState();
  if (!account) return;
  const missing = ids.filter((id) => !seen.includes(id));
  if (!missing.length) return;
  const next = [...seen, ...missing];
  write(account, next);
  useCodexSeen.setState({ seen: next });
}

/** Open pages not read yet. */
export function unreadCodex(open: string[], seen: string[]): string[] {
  const s = new Set(seen);
  return open.filter((id) => !s.has(id));
}
