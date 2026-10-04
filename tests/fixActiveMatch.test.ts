import { describe, expect, it } from 'vitest';
import { GameService } from '@/services/gameService';
import { MemoryStore } from '@/persistence/storage';
import type { ActiveMatch } from '@/domain/activeMatch';
import { migrateSave } from '@/persistence/migrations';
import { createNewSave } from '@/domain/newAccount';

const marker = (over: Partial<ActiveMatch> = {}): ActiveMatch => ({
  id: 'm1',
  mode: 'RANKED',
  startedAt: 1000,
  opponentId: 'online:X',
  opponentName: 'X',
  difficulty: 'NORMAL',
  deckId: 'd',
  deckName: 'Deck',
  deckFaction: 'EMBER',
  opponentRating: 1200,
  ...over,
});

async function serviceWithProfile() {
  const store = new MemoryStore();
  const svc = new GameService(store);
  await svc.createProfile('A', 'flame');
  return { store, svc };
}

describe('reloading during a match with stakes', () => {
  it('counts the abandoned ranked match as a loss on the next start, once', async () => {
    const { store, svc } = await serviceWithProfile();
    const before = svc.current!.profile.ranked;
    svc.beginMatch(marker());
    await svc.flush();
    // "Reload": a new service over the same storage; React StrictMode boots twice.
    const svc2 = new GameService(store);
    const [a, b] = await Promise.all([svc2.init(), svc2.init()]);
    expect(a.kind).toBe('LOADED');
    expect(a).toBe(b);
    await svc2.flush();
    const s = svc2.current!;
    expect(s.profile.activeMatch ?? null).toBeNull();
    expect(s.profile.ranked.losses).toBe(before.losses + 1);
    expect(s.profile.ranked.rating).toBeLessThan(before.rating);
    expect(s.matchHistory[0]).toMatchObject({ mode: 'RANKED', result: 'LOSS', conceded: true });
    // A further reload does not count it again.
    const svc3 = new GameService(store);
    await svc3.init();
    expect(svc3.current!.profile.ranked.losses).toBe(before.losses + 1);
    expect(svc3.current!.matchHistory.length).toBe(s.matchHistory.length);
  });

  it('a normally recorded match clears the marker (no extra loss later)', async () => {
    const { store, svc } = await serviceWithProfile();
    svc.beginMatch(marker({ mode: 'PVP' }));
    svc.recordMatch({ mode: 'PVP', opponentId: 'o', opponentName: 'O', difficulty: 'NORMAL', deckId: 'd', deckName: 'D', deckFaction: 'EMBER', result: 'LOSS', turns: 1, durationMs: 1, stats: { damageDealt: 0, heroDamageDealt: 0, cardsPlayed: 0, unitsPlayed: 0, spellsPlayed: 0, unitsDestroyed: 0, healingDone: 0, cardsDrawn: 0 }, conceded: true });
    expect(svc.current!.profile.activeMatch ?? null).toBeNull();
    await svc.flush();
    const svc2 = new GameService(store);
    await svc2.init();
    expect(svc2.current!.matchHistory.length).toBe(1);
    expect(svc2.current!.profile.losses).toBe(1);
  });

  it('an abandoned Arena match ends the run like a loss', async () => {
    const { store, svc } = await serviceWithProfile();
    const save = svc.current!;
    svc['commit']({ ...save, arena: { ...save.arena, run: { id: 'r', seed: 1, startedAt: 0, factionChoices: ['EMBER', 'TIDE'], faction: 'EMBER', picks: [], talents: null, results: [] } } });
    svc.beginMatch(marker({ mode: 'ARENA', opponentRating: undefined }));
    await svc.flush();
    const svc2 = new GameService(store);
    await svc2.init();
    expect(svc2.current!.matchHistory[0]).toMatchObject({ mode: 'ARENA', result: 'LOSS' });
    expect(svc2.current!.profile.losses).toBe(1);
  });

  it('the marker survives migration only when well formed', () => {
    const s = createNewSave('A', 'flame', 0, 'p');
    expect(migrateSave({ ...s, profile: { ...s.profile, activeMatch: marker() } }).save.profile.activeMatch).toMatchObject({ id: 'm1', opponentRating: 1200 });
    expect(migrateSave({ ...s, profile: { ...s.profile, activeMatch: { id: 3 } } }).save.profile.activeMatch).toBeNull();
    expect(migrateSave({ ...s, profile: { ...s.profile, activeMatch: { ...marker(), opponentRating: 'x' } } }).save.profile.activeMatch!.opponentRating).toBe(1000);
  });
});
