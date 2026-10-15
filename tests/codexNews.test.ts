import { beforeEach, describe, expect, it } from 'vitest';
import { codexEntries, codexProgress, openCodexIds } from '@/ui/codex/codexEntries';
import { markCodexSeen, syncCodexSeen, unreadCodex, useCodexSeen } from '@/ui/codex/codexSeen';
import { codexToastMessage } from '@/ui/components/CodexWatcher';
import { evaluateAchievements } from '@/domain/achievements';
import { createNewSave } from '@/domain/newAccount';
import { PLAYABLE_FACTIONS } from '@/game/types';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
  useCodexSeen.setState({ account: null, seen: [] });
});

describe('Codex news', () => {
  it('counts what is already written as read on the first visit, then flags new pages', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    syncCodexSeen('A', openCodexIds(save));
    expect(unreadCodex(openCodexIds(save), useCodexSeen.getState().seen)).toEqual([]);
    save.pve.seenCinematics = ['world_intro'];
    const fresh = unreadCodex(openCodexIds(save), useCodexSeen.getState().seen);
    expect(fresh).toContain('world_intro:0');
    markCodexSeen(fresh);
    expect(unreadCodex(openCodexIds(save), useCodexSeen.getState().seen)).toEqual([]);
    // Kept per account, across reloads.
    useCodexSeen.setState({ account: null, seen: [] });
    syncCodexSeen('A', []);
    expect(useCodexSeen.getState().seen).toContain('world_intro:0');
  });

  it('names the cinematic or boss in the toast, or counts several', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    save.pve.seenCinematics = ['world_intro'];
    save.pve.completed = { c1_boss: { firstClearAt: 5, wins: 1 } };
    const all = codexEntries(save);
    const shots = all.filter((e) => e.cinematic === 'world_intro');
    expect(codexToastMessage(shots)).toMatch(/^New pages in the Codex: /);
    expect(codexToastMessage([all.find((e) => e.id === 'c1_boss')!])).toMatch(/^New page in the Codex: /);
    expect(codexToastMessage([...shots, all.find((e) => e.id === 'c1_boss')!])).toBe(`${shots.length + 1} new pages in the Codex`);
  });

  it('gives achievements for Codex pages and Warden frames', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    expect(evaluateAchievements(save)).not.toContain('codex_25');
    save.pve.seenCinematics = ['world_intro', 'aethra_intro', 'void_intro', 'lamp_intro', 'inn_intro'];
    expect(codexProgress(save).open).toBeGreaterThanOrEqual(25);
    expect(evaluateAchievements(save)).toContain('codex_25');
    expect(evaluateAchievements(save)).not.toContain('codex_all');

    const [a, b, c] = PLAYABLE_FACTIONS;
    save.profile.factionWins = { [a]: 100, [b]: 100, [c]: 99 };
    expect(evaluateAchievements(save)).not.toContain('frames_3');
    save.profile.factionWins[c] = 100;
    expect(evaluateAchievements(save)).toContain('frames_3');
    expect(evaluateAchievements(save)).not.toContain('frames_all');
    for (const f of PLAYABLE_FACTIONS) save.profile.factionWins[f] = 100;
    expect(evaluateAchievements(save)).toContain('frames_all');
  });
});
