import { describe, expect, it } from 'vitest';
import { MemoryStore } from '@/persistence/storage';
import { CloudSync, MirroredStore, REPLACED_BACKUP_KEY, decideInitialSync, type CloudBackend, type CloudMeta } from '@/cloud/sync';

/** In-memory stand-in for Firestore. */
class FakeBackend implements CloudBackend {
  users = new Map<string, { meta: CloudMeta; slices: Record<string, unknown> }>();
  saves = 0;
  watchers = new Map<string, (m: CloudMeta | null) => void>();
  async loadMeta(uid: string) {
    return this.users.get(uid)?.meta ?? null;
  }
  async loadSlices(uid: string) {
    return structuredClone(this.users.get(uid)?.slices ?? {});
  }
  async saveSlices(uid: string, slices: Record<string, unknown>, meta: CloudMeta) {
    this.saves++;
    const cur = this.users.get(uid) ?? { meta, slices: {} };
    this.users.set(uid, { meta, slices: { ...cur.slices, ...structuredClone(slices) } });
    this.watchers.get(uid)?.(meta);
  }
  async claimSession(uid: string, session: string) {
    const cur = this.users.get(uid);
    if (cur) {
      cur.meta = { ...cur.meta, session };
      this.watchers.get(uid)?.(cur.meta);
    }
  }
  watchMeta(uid: string, cb: (m: CloudMeta | null) => void) {
    this.watchers.set(uid, cb);
    return () => this.watchers.delete(uid);
  }
}

const profile = (name: string) => ({ username: name, level: 3, gold: 120 });

async function localWithSave(name = 'Local', updatedAt = 1000) {
  const local = new MemoryStore();
  await local.setMany([
    ['meta', { saveVersion: 1, updatedAt }],
    ['profile', profile(name)],
    ['collection', { cards: { a: { NORMAL: 2 } } }],
  ]);
  return local;
}

describe('decideInitialSync', () => {
  const meta = (updatedAt: number): CloudMeta => ({ updatedAt, saveVersion: 1, session: 's' });
  it('uploads when the cloud is empty and downloads onto a fresh device', () => {
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 5, link: null, cloud: null })).toBe('upload');
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: null, link: null, cloud: meta(9) })).toBe('download');
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: null, link: null, cloud: null })).toBe('none');
  });
  it('follows whichever side changed since the last sync', () => {
    const link = { uid: 'u', cloudUpdatedAt: 10, localUpdatedAt: 20 };
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 20, link, cloud: meta(10) })).toBe('none');
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 25, link, cloud: meta(10) })).toBe('upload');
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 20, link, cloud: meta(15) })).toBe('download');
    // Both changed (e.g. this device kept playing after another one took the account): the account wins.
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 25, link, cloud: meta(15) })).toBe('download');
  });
  it('loads the account save over a device save that was never linked to the account', () => {
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 5, link: null, cloud: meta(9) })).toBe('download');
    expect(decideInitialSync({ uid: 'u', localUpdatedAt: 5, link: { uid: 'other', cloudUpdatedAt: 1, localUpdatedAt: 1 }, cloud: meta(9) })).toBe('download');
  });
});

describe('CloudSync', () => {
  it('uploads an existing local save on first sign-in, then mirrors later changes', async () => {
    const local = await localWithSave();
    const mirrored = new MirroredStore(local);
    const backend = new FakeBackend();
    const sync = new CloudSync(mirrored, backend, { debounceMs: 0, reload: () => undefined });
    const result = await sync.attach('u1');
    expect(result).toEqual({ kind: 'uploaded' });
    expect((backend.users.get('u1')!.slices.profile as { username: string }).username).toBe('Local');

    await mirrored.setMany([['profile', profile('Renamed')], ['meta', { saveVersion: 1, updatedAt: 2000 }]]);
    await sync.flushNow();
    expect((backend.users.get('u1')!.slices.profile as { username: string }).username).toBe('Renamed');
  });

  it('downloads the cloud save onto a fresh device and reloads', async () => {
    const backend = new FakeBackend();
    backend.users.set('u1', { meta: { updatedAt: 500, saveVersion: 1, session: 'x' }, slices: { meta: { saveVersion: 1, updatedAt: 500 }, profile: profile('Cloud') } });
    const local = new MemoryStore();
    let reloaded = false;
    const sync = new CloudSync(new MirroredStore(local), backend, { debounceMs: 0, reload: () => (reloaded = true) });
    expect(await sync.attach('u1')).toEqual({ kind: 'downloaded' });
    expect(((await local.get('profile')) as { username: string }).username).toBe('Cloud');
    expect(reloaded).toBe(true);
  });

  it('signing in on another device loads the account save, keeping the device save as a backup', async () => {
    const backend = new FakeBackend();
    backend.users.set('u1', { meta: { updatedAt: 500, saveVersion: 1, session: 'x' }, slices: { meta: { saveVersion: 1, updatedAt: 500 }, profile: profile('Cloud') } });
    const local = await localWithSave('Local');
    let reloaded = false;
    const sync = new CloudSync(new MirroredStore(local), backend, { debounceMs: 0, reload: () => (reloaded = true) });
    expect(await sync.attach('u1')).toEqual({ kind: 'downloaded' });
    expect(reloaded).toBe(true);
    expect(((await local.get('profile')) as { username: string }).username).toBe('Cloud');
    expect(((await local.get<Record<string, { username: string }>>(REPLACED_BACKUP_KEY))!.profile).username).toBe('Local');
    expect((backend.users.get('u1')!.slices.profile as { username: string }).username).toBe('Cloud');
  });

  it('stops syncing when another device claims the account', async () => {
    const local = await localWithSave();
    const mirrored = new MirroredStore(local);
    const backend = new FakeBackend();
    const statuses: string[] = [];
    const sync = new CloudSync(mirrored, backend, { debounceMs: 0, reload: () => undefined, onStatus: (s) => statuses.push(s) });
    await sync.attach('u1');
    await backend.claimSession('u1', 'someone-else');
    expect(sync.status).toBe('paused');
    const before = backend.saves;
    await mirrored.setMany([['profile', profile('Ignored')]]);
    await sync.flushNow();
    expect(backend.saves).toBe(before);
  });

  it('does not mirror anything while signed out', async () => {
    const local = await localWithSave();
    const mirrored = new MirroredStore(local);
    const backend = new FakeBackend();
    const sync = new CloudSync(mirrored, backend, { debounceMs: 0, reload: () => undefined });
    await mirrored.setMany([['profile', profile('Offline')]]);
    await sync.flushNow();
    expect(backend.saves).toBe(0);
  });
});
