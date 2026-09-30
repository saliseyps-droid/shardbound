/**
 * Minimal async key-value abstraction. Repositories are written against this so
 * IndexedDB can later be swapped for a REST/cloud backend without touching UI.
 */
export interface KeyValueStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  setMany(entries: [string, unknown][]): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, unknown>();
  async get<T>(key: string) {
    const v = this.data.get(key);
    return v === undefined ? undefined : (structuredClone(v) as T);
  }
  async set<T>(key: string, value: T) {
    this.data.set(key, structuredClone(value));
  }
  async setMany(entries: [string, unknown][]) {
    for (const [k, v] of entries) this.data.set(k, structuredClone(v));
  }
  async delete(key: string) {
    this.data.delete(key);
  }
  async keys() {
    return [...this.data.keys()];
  }
  async clear() {
    this.data.clear();
  }
}

const DB_NAME = 'shardbound';
const DB_VERSION = 1;
const STORE = 'kv';

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class IndexedDbStore implements KeyValueStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly dbName = DB_NAME) {}

  static isAvailable(): boolean {
    try {
      return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
      return false;
    }
  }

  private db(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('IndexedDB is blocked by another tab'));
      });
      this.dbPromise.catch(() => (this.dbPromise = null));
    }
    return this.dbPromise;
  }

  private async tx(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.db();
    return db.transaction(STORE, mode).objectStore(STORE);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const store = await this.tx('readonly');
    return (await promisify(store.get(key))) as T | undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.setMany([[key, value]]);
  }

  /** Writes all entries in a single transaction so a save is atomic. */
  async setMany(entries: [string, unknown][]): Promise<void> {
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      for (const [k, v] of entries) store.put(v, k);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
    });
  }

  async delete(key: string): Promise<void> {
    const store = await this.tx('readwrite');
    await promisify(store.delete(key));
  }

  async keys(): Promise<string[]> {
    const store = await this.tx('readonly');
    return (await promisify(store.getAllKeys())).map(String);
  }

  async clear(): Promise<void> {
    const store = await this.tx('readwrite');
    await promisify(store.clear());
  }
}
