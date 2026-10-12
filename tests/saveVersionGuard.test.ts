import { describe, expect, it } from 'vitest';
import { GameService } from '@/services/gameService';
import { MemoryStore } from '@/persistence/storage';
import { KEYS, type SaveMeta } from '@/persistence/repositories';
import { APP_VERSION, isNewerVersion } from '@/persistence/appVersion';
import { LATEST_PATCH } from '@/data/patchNotes';

const newerThan = (v: string) => v.split('.').map((n, i, a) => (i === a.length - 1 ? Number(n) + 1 : n)).join('.');

describe('saves made by a newer version of the game', () => {
  it('compares versions by number', () => {
    expect(isNewerVersion('0.42.1', '0.42.0')).toBe(true);
    expect(isNewerVersion('0.10.0', '0.9.9')).toBe(true);
    expect(isNewerVersion('0.42.0', '0.42.0')).toBe(false);
    expect(isNewerVersion(undefined, '0.42.0')).toBe(false);
    expect(APP_VERSION).toBe(LATEST_PATCH);
  });

  it('stamps every save with the version that wrote it', async () => {
    const store = new MemoryStore();
    const svc = new GameService(store);
    await svc.init();
    await svc.createProfile('Tester', 'flame');
    expect((await store.get<SaveMeta>(KEYS.meta))?.appVersion).toBe(APP_VERSION);
  });

  it('an older copy neither loads nor rewrites a newer save, so unknown cards survive', async () => {
    const store = new MemoryStore();
    const first = new GameService(store);
    await first.init();
    await first.createProfile('Tester', 'flame');
    // A newer version adds a card this copy does not know and stamps the save.
    const collection = (await store.get<{ cards: Record<string, unknown> }>(KEYS.collection))!;
    collection.cards.future_card = { NORMAL: 2, FOIL: 0, PRISMATIC: 0 };
    await store.set(KEYS.collection, collection);
    const meta = (await store.get<SaveMeta>(KEYS.meta))!;
    await store.set(KEYS.meta, { ...meta, appVersion: newerThan(APP_VERSION) });

    const old = new GameService(store);
    const res = await old.init();
    expect(res.kind).toBe('OUTDATED');
    await old.flush();
    expect((await store.get<{ cards: Record<string, unknown> }>(KEYS.collection))!.cards.future_card).toBeTruthy();
  });

  it('a tab that is already open stops writing once a newer version saved', async () => {
    const store = new MemoryStore();
    const svc = new GameService(store);
    await svc.init();
    await svc.createProfile('Tester', 'flame');
    let outdated = '';
    svc.onOutdated((v) => (outdated = v));
    const meta = (await store.get<SaveMeta>(KEYS.meta))!;
    const newer = { ...meta, appVersion: newerThan(APP_VERSION), updatedAt: 1 };
    await store.set(KEYS.meta, newer);
    svc.setFavoriteDeck(svc.current!.decks[0].id);
    await svc.flush();
    expect(await store.get<SaveMeta>(KEYS.meta)).toEqual(newer);
    expect(outdated).toBe(newer.appVersion);
    // Later changes are not written either.
    svc.setFavoriteDeck(svc.current!.decks[0].id);
    await svc.flush();
    expect(await store.get<SaveMeta>(KEYS.meta)).toEqual(newer);
  });
});
