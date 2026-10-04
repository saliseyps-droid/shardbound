import type { KeyValueStore } from '@/persistence/storage';
import { KEYS, type SaveMeta } from '@/persistence/repositories';

/**
 * Cloud save. The device keeps its local store (IndexedDB) as the working copy, so the
 * game stays fast and works offline; when the player is signed in, every change to a
 * save slice is mirrored to the cloud a moment later. Only one device syncs at a time:
 * signing in elsewhere "claims" the account and the other device stops uploading.
 *
 * Nothing here knows about Firebase: it talks to a CloudBackend (Firestore in
 * src/cloud/firestore.ts, an in-memory fake in tests).
 */

export interface CloudMeta {
  /** Local save time of the last upload (ms). Compared with the device's link to decide who is newer. */
  updatedAt: number;
  saveVersion: number;
  /** Device session that owns the account right now. */
  session: string;
}

export interface CloudBackend {
  loadMeta(uid: string): Promise<CloudMeta | null>;
  loadSlices(uid: string): Promise<Record<string, unknown>>;
  saveSlices(uid: string, slices: Record<string, unknown>, meta: CloudMeta): Promise<void>;
  claimSession(uid: string, session: string): Promise<void>;
  watchMeta(uid: string, cb: (meta: CloudMeta | null) => void): () => void;
}

/** Which account this device last synced with, and the save times on both sides at that moment. */
export interface CloudLink {
  uid: string;
  cloudUpdatedAt: number;
  localUpdatedAt: number;
}

export type SyncDecision = 'none' | 'upload' | 'download' | 'ask';

/** Pure: what to do when a player signs in on this device. */
export function decideInitialSync(input: { uid: string; localUpdatedAt: number | null; link: CloudLink | null; cloud: CloudMeta | null }): SyncDecision {
  const { uid, localUpdatedAt, link, cloud } = input;
  if (!cloud) return localUpdatedAt === null ? 'none' : 'upload';
  if (localUpdatedAt === null) return 'download';
  if (!link || link.uid !== uid) return 'ask';
  const cloudChanged = cloud.updatedAt !== link.cloudUpdatedAt;
  const localChanged = localUpdatedAt !== link.localUpdatedAt;
  if (cloudChanged && localChanged) return 'ask';
  if (cloudChanged) return 'download';
  if (localChanged) return 'upload';
  return 'none';
}

/** What the conflict dialog shows for each side. */
export interface SaveSummary {
  username: string;
  level: number;
  gold: number;
  cards: number;
  updatedAt: number | null;
}

export function summarize(slices: Record<string, unknown>): SaveSummary {
  const p = (slices[KEYS.profile] ?? {}) as { username?: string; level?: number; gold?: number };
  const c = (slices[KEYS.collection] ?? {}) as { cards?: Record<string, Record<string, number>> };
  const meta = slices[KEYS.meta] as SaveMeta | undefined;
  let cards = 0;
  for (const v of Object.values(c.cards ?? {})) for (const n of Object.values(v ?? {})) cards += Number(n) || 0;
  return { username: p.username ?? '?', level: p.level ?? 1, gold: p.gold ?? 0, cards, updatedAt: meta?.updatedAt ?? null };
}

/** Save slices that travel to the cloud (backups and the link itself stay on the device). */
const SYNCED_KEYS: readonly string[] = Object.values(KEYS);
const LINK_KEY = 'cloudLink';

/**
 * KeyValueStore wrapper used by the game: writes go to the local store and the
 * changed save keys are reported to the cloud sync (when one is listening).
 */
export class MirroredStore implements KeyValueStore {
  private listener: ((keys: string[]) => void) | null = null;

  constructor(readonly local: KeyValueStore) {}

  setListener(listener: ((keys: string[]) => void) | null) {
    this.listener = listener;
  }

  private changed(keys: string[]) {
    const synced = keys.filter((k) => SYNCED_KEYS.includes(k));
    if (synced.length && this.listener) this.listener(synced);
  }

  get<T>(key: string) {
    return this.local.get<T>(key);
  }
  async set<T>(key: string, value: T) {
    await this.local.set(key, value);
    this.changed([key]);
  }
  async setMany(entries: [string, unknown][]) {
    await this.local.setMany(entries);
    this.changed(entries.map(([k]) => k));
  }
  async delete(key: string) {
    await this.local.delete(key);
    this.changed([key]);
  }
  keys() {
    return this.local.keys();
  }
  clear() {
    return this.local.clear();
  }
}

export type SyncStatus = 'signed-out' | 'checking' | 'synced' | 'syncing' | 'error' | 'paused' | 'conflict';

export type AttachResult = { kind: 'uploaded' } | { kind: 'downloaded' } | { kind: 'in-sync' } | { kind: 'conflict'; local: SaveSummary; cloud: SaveSummary };

interface SyncOptions {
  /** Wait this long after a change before uploading, so bursts of changes become one write. */
  debounceMs?: number;
  /** Called after the cloud save replaced the local one (the app must restart from it). */
  reload: () => void;
  onStatus?: (status: SyncStatus) => void;
  /** Unique per page load. */
  session?: string;
}

export class CloudSync {
  status: SyncStatus = 'signed-out';
  private uid: string | null = null;
  private dirty = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running: Promise<void> = Promise.resolve();
  private unwatch: (() => void) | null = null;
  private pendingConflict: { cloud: Record<string, unknown> } | null = null;
  readonly session: string;

  constructor(
    private readonly store: MirroredStore,
    private readonly backend: CloudBackend,
    private readonly opts: SyncOptions,
  ) {
    this.session = opts.session ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private setStatus(s: SyncStatus) {
    this.status = s;
    this.opts.onStatus?.(s);
  }

  /** Signed in: decide between upload, download and asking the player. */
  async attach(uid: string): Promise<AttachResult> {
    this.detach();
    this.uid = uid;
    this.setStatus('checking');
    // Track saves from now on: writes made during the checks below must still be uploaded.
    this.store.setListener((keys) => {
      if (this.uid === uid) keys.forEach((k) => this.dirty.add(k));
    });
    try {
      const [cloud, localMeta, link] = await Promise.all([this.backend.loadMeta(uid), this.store.local.get<SaveMeta>(KEYS.meta), this.store.local.get<CloudLink>(LINK_KEY)]);
      const hasLocal = !!(await this.store.local.get(KEYS.profile));
      const decision = decideInitialSync({ uid, localUpdatedAt: hasLocal ? (localMeta?.updatedAt ?? 0) : null, link: link ?? null, cloud });
      if (decision === 'download') {
        await this.download();
        return { kind: 'downloaded' };
      }
      if (decision === 'ask') {
        const cloudSlices = await this.backend.loadSlices(uid);
        this.pendingConflict = { cloud: cloudSlices };
        this.setStatus('conflict');
        return { kind: 'conflict', local: summarize(await this.readLocal()), cloud: summarize(cloudSlices) };
      }
      if (decision === 'upload') await this.uploadAll();
      else if (cloud) await this.backend.claimSession(uid, this.session);
      this.startMirroring();
      return decision === 'upload' ? { kind: 'uploaded' } : { kind: 'in-sync' };
    } catch (e) {
      this.setStatus('error');
      throw e;
    }
  }

  /** The player chose which save to keep after a conflict. */
  async resolve(keep: 'local' | 'cloud') {
    if (!this.uid || !this.pendingConflict) return;
    this.pendingConflict = null;
    if (keep === 'cloud') {
      await this.download();
      return;
    }
    await this.uploadAll();
    this.startMirroring();
  }

  /** Another device owns the account; take it back by loading the cloud save here. */
  async takeOver() {
    if (!this.uid) return;
    await this.download();
  }

  detach() {
    this.unwatch?.();
    this.unwatch = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.store.setListener(null);
    this.dirty.clear();
    this.uid = null;
    this.pendingConflict = null;
    this.setStatus('signed-out');
  }

  /** Uploads pending changes right away (tests, before signing out). */
  async flushNow() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    await this.queueUpload();
  }

  private scheduleUpload() {
    this.setStatus('syncing');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.queueUpload();
    }, this.opts.debounceMs ?? 3000);
  }

  private startMirroring() {
    const uid = this.uid!;
    this.store.setListener((keys) => {
      if (this.status === 'paused' || this.uid !== uid) return;
      keys.forEach((k) => this.dirty.add(k));
      this.scheduleUpload();
    });
    this.unwatch = this.backend.watchMeta(uid, (meta) => {
      if (meta && meta.session !== this.session && this.uid === uid) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        this.dirty.clear();
        this.setStatus('paused');
      }
    });
    this.setStatus('synced');
    // Saves made while signing in (their time may already be in the uploaded meta) go up now.
    if (this.dirty.size > 0) this.scheduleUpload();
  }

  private queueUpload(): Promise<void> {
    this.running = this.running.then(async () => {
      if (!this.uid || this.status === 'paused' || this.dirty.size === 0) return;
      const keys = [...this.dirty];
      this.dirty.clear();
      try {
        const slices: Record<string, unknown> = {};
        for (const k of keys) slices[k] = (await this.store.local.get(k)) ?? null;
        await this.push(slices);
        if (this.dirty.size === 0 && (this.status as SyncStatus) !== 'paused') this.setStatus('synced');
      } catch (e) {
        keys.forEach((k) => this.dirty.add(k));
        this.setStatus('error');
        console.error('[cloud] upload failed', e);
      }
    });
    return this.running;
  }

  private async readLocal(): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const k of SYNCED_KEYS) {
      const v = await this.store.local.get(k);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }

  private async uploadAll() {
    this.setStatus('syncing');
    // Everything is read below; only writes after this point need another upload.
    this.dirty.clear();
    await this.push(await this.readLocal());
    this.setStatus('synced');
  }

  private async push(slices: Record<string, unknown>) {
    const uid = this.uid!;
    const localMeta = await this.store.local.get<SaveMeta>(KEYS.meta);
    const updatedAt = localMeta?.updatedAt ?? Date.now();
    await this.backend.saveSlices(uid, slices, { updatedAt, saveVersion: localMeta?.saveVersion ?? 0, session: this.session });
    await this.store.local.set<CloudLink>(LINK_KEY, { uid, cloudUpdatedAt: updatedAt, localUpdatedAt: updatedAt });
  }

  /** Replaces the local save with the cloud one, then restarts the app from it. */
  private async download() {
    const uid = this.uid!;
    this.setStatus('syncing');
    const [slices, meta] = await Promise.all([this.backend.loadSlices(uid), this.backend.loadMeta(uid)]);
    const entries: [string, unknown][] = [];
    for (const k of SYNCED_KEYS) if (slices[k] !== undefined && slices[k] !== null) entries.push([k, slices[k]]);
    for (const k of SYNCED_KEYS) if (slices[k] === undefined || slices[k] === null) await this.store.local.delete(k);
    await this.store.local.setMany(entries);
    const localUpdatedAt = (slices[KEYS.meta] as SaveMeta | undefined)?.updatedAt ?? meta?.updatedAt ?? 0;
    await this.store.local.set<CloudLink>(LINK_KEY, { uid, cloudUpdatedAt: meta?.updatedAt ?? localUpdatedAt, localUpdatedAt });
    await this.backend.claimSession(uid, this.session);
    this.opts.reload();
  }
}
