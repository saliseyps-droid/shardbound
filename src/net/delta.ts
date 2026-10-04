/**
 * Small structural diff/patch for plain JSON values (objects, arrays, primitives).
 * Used to send the online guest only what changed in its view since the last message.
 *
 * Patch encoding (compact, JSON-safe):
 *   [0, value]                     replace with `value`
 *   [1, { key: patch }, deleted?]  object: patch/add these keys, remove `deleted`
 *   [2, length, { index: patch }]  array: resize to `length`, patch these indices
 *   [3, start, deleteCount, items] array: splice
 *   [4, drop, items]               array: drop `drop` items from the front, append `items`
 *                                  (a sliding window, e.g. the capped match log)
 * `diff` returns null when both values are equal.
 */

export type Patch =
  | [0, unknown]
  | [1, Record<string, Patch>]
  | [1, Record<string, Patch>, string[]]
  | [2, number, Record<string, Patch>]
  | [3, number, number, unknown[]]
  | [4, number, unknown[]];

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (Array.isArray(b)) return false;
  const ka = Object.keys(a as Obj);
  if (ka.length !== Object.keys(b as Obj).length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual((a as Obj)[k], (b as Obj)[k])) return false;
  }
  return true;
}

const size = (v: unknown) => JSON.stringify(v).length;

function smallest(candidates: Patch[]): Patch {
  let best = candidates[0];
  let bestSize = size(best);
  for (let i = 1; i < candidates.length; i++) {
    const s = size(candidates[i]);
    if (s < bestSize) [best, bestSize] = [candidates[i], s];
  }
  return best;
}

function diffArray(a: unknown[], b: unknown[]): Patch | null {
  const min = Math.min(a.length, b.length);
  let pre = 0;
  while (pre < min && deepEqual(a[pre], b[pre])) pre++;
  if (pre === a.length && pre === b.length) return null;
  let suf = 0;
  while (suf < min - pre && deepEqual(a[a.length - 1 - suf], b[b.length - 1 - suf])) suf++;

  // By index: patch changed positions, resize, append new tail.
  const byIndex: Record<string, Patch> = {};
  const end = a.length === b.length ? b.length - suf : b.length;
  for (let i = pre; i < end; i++) {
    if (i < a.length) {
      const d = diff(a[i], b[i]);
      if (d) byIndex[i] = d;
    } else byIndex[i] = [0, b[i]];
  }
  const candidates: Patch[] = [[2, b.length, byIndex]];
  // Splice the differing middle (cheap when something was inserted/removed in the middle).
  candidates.push([3, pre, a.length - pre - suf, b.slice(pre, b.length - suf)]);
  if (pre === 0) {
    const drop = slideOffset(a, b);
    if (drop > 0) candidates.push([4, drop, b.slice(a.length - drop)]);
  }
  candidates.push([0, b]);
  return smallest(candidates);
}

/** k > 0 when `b` starts with `a` minus its first k items (a window that slid forward), else 0. */
function slideOffset(a: unknown[], b: unknown[]): number {
  for (let k = 1; k < a.length; k++) {
    if (a.length - k > b.length || !deepEqual(a[k], b[0])) continue;
    let ok = true;
    for (let j = 1; ok && k + j < a.length; j++) ok = deepEqual(a[k + j], b[j]);
    if (ok) return k;
  }
  return 0;
}

function diffObject(a: Obj, b: Obj): Patch | null {
  const changes: Record<string, Patch> = {};
  let any = false;
  for (const k of Object.keys(b)) {
    if (b[k] === undefined) continue; // JSON drops undefined
    if (!Object.prototype.hasOwnProperty.call(a, k) || a[k] === undefined) {
      changes[k] = [0, b[k]];
      any = true;
    } else {
      const d = diff(a[k], b[k]);
      if (d) {
        changes[k] = d;
        any = true;
      }
    }
  }
  const deleted: string[] = [];
  for (const k of Object.keys(a)) {
    if (a[k] !== undefined && (!Object.prototype.hasOwnProperty.call(b, k) || b[k] === undefined)) deleted.push(k);
  }
  if (!any && !deleted.length) return null;
  const patch: Patch = deleted.length ? [1, changes, deleted] : [1, changes];
  return smallest([patch, [0, b]]);
}

/** Patch that turns `a` into `b` (null when they are equal). */
export function diff(a: unknown, b: unknown): Patch | null {
  if (a === b) return null;
  if (Array.isArray(a) && Array.isArray(b)) return diffArray(a, b);
  if (isObj(a) && isObj(b)) return diffObject(a, b);
  if (deepEqual(a, b)) return null;
  return [0, b];
}

/** Applies a patch without mutating `a` (unchanged parts are shared). Throws on a malformed patch. */
export function applyPatch<T = unknown>(a: unknown, p: Patch | null): T {
  if (p === null) return a as T;
  if (!Array.isArray(p)) throw new Error('bad patch');
  switch (p[0]) {
    case 0:
      return p[1] as T;
    case 1: {
      if (!isObj(a) || !isObj(p[1])) throw new Error('bad object patch');
      const out: Obj = { ...a };
      for (const [k, sub] of Object.entries(p[1])) out[k] = applyPatch(a[k], sub);
      if (p[2] !== undefined) {
        if (!Array.isArray(p[2])) throw new Error('bad object patch');
        for (const k of p[2]) delete out[k];
      }
      return out as T;
    }
    case 2: {
      const [, len, changes] = p;
      if (!Array.isArray(a) || typeof len !== 'number' || len < 0 || !isObj(changes)) throw new Error('bad array patch');
      const out = a.slice(0, len);
      while (out.length < len) out.push(null);
      for (const [k, sub] of Object.entries(changes)) {
        const i = Number(k);
        if (!Number.isInteger(i) || i < 0 || i >= len) throw new Error('bad array patch');
        out[i] = applyPatch(a[i], sub);
      }
      return out as T;
    }
    case 3: {
      const [, start, del, items] = p;
      if (!Array.isArray(a) || !Array.isArray(items) || typeof start !== 'number' || typeof del !== 'number' || start < 0 || start + del > a.length) throw new Error('bad splice patch');
      const out = a.slice();
      out.splice(start, del, ...items);
      return out as T;
    }
    case 4: {
      const [, drop, items] = p;
      if (!Array.isArray(a) || !Array.isArray(items) || typeof drop !== 'number' || drop < 0 || drop > a.length) throw new Error('bad slide patch');
      return a.slice(drop).concat(items) as T;
    }
    default:
      throw new Error('bad patch');
  }
}

/** Order-independent hash of a JSON value (object key order does not matter). */
export function stableHash(value: unknown): number {
  let h = 0x811c9dc5;
  const feed = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
  };
  const walk = (v: unknown) => {
    if (Array.isArray(v)) {
      feed('[');
      for (const x of v) {
        walk(x === undefined ? null : x);
        feed(',');
      }
      feed(']');
    } else if (isObj(v)) {
      feed('{');
      for (const k of Object.keys(v).sort()) {
        if (v[k] === undefined) continue;
        feed(k);
        feed(':');
        walk(v[k]);
        feed(',');
      }
      feed('}');
    } else feed(JSON.stringify(v) ?? 'null');
  };
  walk(value);
  return h >>> 0;
}
