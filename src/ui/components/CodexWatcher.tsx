import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { useUi } from '@/state/uiStore';
import { codexEntries, type CodexEntry } from '@/ui/codex/codexEntries';
import { syncCodexSeen } from '@/ui/codex/codexSeen';
import { t, tn } from '@/i18n';

/** "New page in the Codex: …" for pages written just now (one per cinematic or boss, or a count). */
export function codexToastMessage(pages: CodexEntry[]): string {
  const groups = new Map<string, CodexEntry[]>();
  for (const e of pages) {
    const k = e.cinematic ?? e.id;
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  if (groups.size === 1) {
    const [first] = pages;
    const name = t(first.title);
    return pages.length === 1 ? t('New page in the Codex: {name}', { name }) : t('New pages in the Codex: {name}', { name });
  }
  return tn(pages.length, '{n} new page in the Codex', '{n} new pages in the Codex');
}

/**
 * Watches the Codex while the player plays: pages written during this visit are announced with a
 * toast that opens the book. During a match the news waits until the player leaves it.
 */
export function CodexWatcher() {
  const save = useAccount((s) => s.save);
  const account = save?.profile.username ?? null;
  const entries = useMemo(() => (save ? codexEntries(save) : []), [save]);
  const location = useLocation();
  const inMatch = location.pathname.startsWith('/match');
  const known = useRef<{ account: string; ids: Set<string> } | null>(null);
  const pending = useRef<string[]>([]);

  useEffect(() => {
    if (!account) return;
    const open = entries.filter((e) => e.unlocked).map((e) => e.id);
    syncCodexSeen(account, open);
    if (known.current?.account !== account) {
      known.current = { account, ids: new Set(open) };
      pending.current = [];
      return;
    }
    const ids = known.current.ids;
    for (const id of open) {
      if (ids.has(id)) continue;
      ids.add(id);
      pending.current.push(id);
    }
    if (inMatch || location.pathname === '/codex' || !pending.current.length) {
      if (location.pathname === '/codex') pending.current = [];
      return;
    }
    const pages = entries.filter((e) => pending.current.includes(e.id));
    pending.current = [];
    if (pages.length) useUi.getState().pushToast(codexToastMessage(pages), 'reward', '/codex');
  }, [account, entries, inMatch, location.pathname]);

  return null;
}
