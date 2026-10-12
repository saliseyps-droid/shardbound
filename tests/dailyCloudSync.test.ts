import { describe, expect, it } from 'vitest';
import { MemoryStore } from '@/persistence/storage';
import { KEYS, type SaveMeta } from '@/persistence/repositories';
import { GameService } from '@/services/gameService';
import { CloudSync, MirroredStore, cloudSettled, type CloudBackend, type CloudMeta, type SyncStatus } from '@/cloud/sync';

/** In-memory stand-in for Firestore. */
class FakeBackend implements CloudBackend {
  users = new Map<string, { meta: CloudMeta; slices: Record<string, unknown> }>();
  async loadMeta(uid: string) {
    return this.users.get(uid)?.meta ?? null;
  }
  async loadSlices(uid: string) {
    return structuredClone(this.users.get(uid)?.slices ?? {});
  }
  async saveSlices(uid: string, slices: Record<string, unknown>, meta: CloudMeta) {
    const cur = this.users.get(uid) ?? { meta, slices: {} };
    this.users.set(uid, { meta, slices: { ...cur.slices, ...structuredClone(slices) } });
  }
  async claimSession(uid: string, session: string) {
    const cur = this.users.get(uid);
    if (cur) cur.meta = { ...cur.meta, session };
  }
  watchMeta() {
    return () => undefined;
  }
}

const signedIn = (status: SyncStatus) => cloudSettled({ configured: true, ready: true, signedIn: true, status });

describe('daily reward across devices', () => {
  it('is not offered before Firebase reports the player or while the save may still be replaced', () => {
    expect(cloudSettled({ configured: true, ready: false, signedIn: false, status: 'signed-out' })).toBe(false);
    // Signed in, but the check against the cloud save has not started yet.
    expect(signedIn('signed-out')).toBe(false);
    expect(signedIn('checking')).toBe(false);
    expect(signedIn('conflict')).toBe(false);
    expect(signedIn('paused')).toBe(false);
    expect(signedIn('synced')).toBe(true);
    expect(signedIn('syncing')).toBe(true);
    expect(cloudSettled({ configured: true, ready: true, signedIn: false, status: 'signed-out' })).toBe(true);
    expect(cloudSettled({ configured: false, ready: false, signedIn: false, status: 'signed-out' })).toBe(true);
  });

  it('a device with an old save cannot claim again after another device claimed today', async () => {
    const backend = new FakeBackend();
    // Mobile: claims today and uploads.
    const mobileStore = new MemoryStore();
    const mobile = new GameService(new MirroredStore(mobileStore));
    await mobile.createProfile('Player', 'a');
    expect(mobile.claimDaily().ok).toBe(true);
    await mobile.flush();
    const mobileSync = new CloudSync(new MirroredStore(mobileStore), backend, { debounceMs: 0, reload: () => undefined });
    expect((await mobileSync.attach('u')).kind).toBe('uploaded');

    // PC: the same account, linked earlier, with a save from before today's claim.
    const pcStore = new MemoryStore();
    const pc = new GameService(new MirroredStore(pcStore));
    await pc.createProfile('Player', 'a');
    await pc.flush();
    const pcMeta = (await pcStore.get<SaveMeta>(KEYS.meta))!;
    await pcStore.set('cloudLink', { uid: 'u', cloudUpdatedAt: pcMeta.updatedAt - 1, localUpdatedAt: pcMeta.updatedAt });
    // The stale PC save on its own would offer Day 1.
    expect(pc.current!.daily.lastClaimDay).toBeNull();

    const statuses: SyncStatus[] = [];
    let reloaded = false;
    const pcSync = new CloudSync(new MirroredStore(pcStore), backend, {
      debounceMs: 0,
      reload: () => {
        reloaded = true;
      },
      onStatus: (s) => statuses.push(s),
    });
    expect((await pcSync.attach('u')).kind).toBe('downloaded');
    expect(reloaded).toBe(true);
    // The claim stays locked the whole time the PC save is about to be replaced.
    expect(statuses.length).toBeGreaterThan(0);
    for (const s of statuses) expect(signedIn(s)).toBe(false);

    // After the restart the PC runs the cloud save: today's reward is already claimed.
    const pcAfter = new GameService(new MirroredStore(pcStore));
    await pcAfter.init();
    expect(pcAfter.claimDaily().ok).toBe(false);
  });
});
