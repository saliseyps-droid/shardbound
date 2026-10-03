import type { Firestore } from 'firebase/firestore';
import type { CloudBackend, CloudMeta } from './sync';

/**
 * Firestore layout:
 *   users/{uid}             { updatedAt, saveVersion, session }
 *   users/{uid}/save/{key}  { json }   one document per save slice (profile, collection, decks, ...)
 * Slices are stored as JSON strings: the save has values Firestore cannot hold
 * directly (undefined fields, nested arrays) and each slice stays far below 1 MiB.
 */
export async function createFirestoreBackend(db: Firestore): Promise<CloudBackend> {
  const { collection, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } = await import('firebase/firestore');
  const userDoc = (uid: string) => doc(db, 'users', uid);
  const toMeta = (data: Record<string, unknown> | undefined): CloudMeta | null =>
    data && typeof data.updatedAt === 'number' ? { updatedAt: data.updatedAt, saveVersion: Number(data.saveVersion) || 0, session: String(data.session ?? '') } : null;

  return {
    async loadMeta(uid) {
      const snap = await getDoc(userDoc(uid));
      return toMeta(snap.data());
    },
    async loadSlices(uid) {
      const snap = await getDocs(collection(db, 'users', uid, 'save'));
      const out: Record<string, unknown> = {};
      snap.forEach((d) => {
        const json = d.data().json;
        if (typeof json === 'string') out[d.id] = JSON.parse(json);
      });
      return out;
    },
    async saveSlices(uid, slices, meta) {
      const batch = writeBatch(db);
      for (const [key, value] of Object.entries(slices)) batch.set(doc(db, 'users', uid, 'save', key), { json: JSON.stringify(value ?? null) });
      batch.set(userDoc(uid), { updatedAt: meta.updatedAt, saveVersion: meta.saveVersion, session: meta.session });
      await batch.commit();
    },
    async claimSession(uid, session) {
      await setDoc(userDoc(uid), { session }, { merge: true });
    },
    watchMeta(uid, cb) {
      return onSnapshot(userDoc(uid), (snap) => cb(toMeta(snap.data())), (e) => console.error('[cloud] watch failed', e));
    },
  };
}
