import { describe, expect, it } from 'vitest';
import { MemoryStore } from '@/persistence/storage';
import { CloudSync, MirroredStore, type CloudBackend, type CloudMeta } from '@/cloud/sync';

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


describe('cloud sync: changes made while signing in', () => {
  for (const linked of [true, false]) {
    it(`uploads a slice written during attach (${linked ? 'in sync' : 'first upload'})`, async () => {
      const local = await localWithSave('Local', 1000);
      const backend = new FakeBackend();
      if (linked) {
        backend.users.set('u', { meta: { updatedAt: 1000, saveVersion: 1, session: 'old' }, slices: { profile: profile('Local'), meta: { saveVersion: 1, updatedAt: 1000 } } });
        await local.set('cloudLink', { uid: 'u', cloudUpdatedAt: 1000, localUpdatedAt: 1000 });
      }
      const mirrored = new MirroredStore(local);
      const sync = new CloudSync(mirrored, backend, { debounceMs: 0, reload: () => undefined });
      // The game saves while the sign-in check is still talking to the server.
      const loadMeta = backend.loadMeta.bind(backend);
      backend.loadMeta = async (uid: string) => {
        const meta = await loadMeta(uid);
        await mirrored.setMany([['profile', profile('DuringAttach')], ['meta', { saveVersion: 1, updatedAt: 1500 }]]);
        return meta;
      };
      await sync.attach('u');
      await new Promise((r) => setTimeout(r, 5));
      await sync.flushNow();
      expect((backend.users.get('u')!.slices.profile as { username: string }).username).toBe('DuringAttach');
    });
  }
});
