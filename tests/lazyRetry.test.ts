import { describe, expect, it, vi } from 'vitest';
import { isChunkLoadError, loadWithReload } from '@/ui/lazyRetry';

const storage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

describe('stale chunks after a deploy', () => {
  it('recognises the browsers’ chunk-load errors', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/ShopScreen-abc.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('reloads the page once when a screen file is gone', async () => {
    const reload = vi.fn();
    const store = storage();
    const p = loadWithReload(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module: x')), { reload, storage: store });
    await new Promise((r) => setTimeout(r, 0));
    expect(reload).toHaveBeenCalledTimes(1);
    void p;
    // Still failing after the reload: show the error instead of looping.
    await expect(loadWithReload(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module: x')), { reload, storage: store })).rejects.toThrow();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('passes other errors and successful loads through', async () => {
    const reload = vi.fn();
    await expect(loadWithReload(() => Promise.reject(new Error('boom')), { reload, storage: storage() })).rejects.toThrow('boom');
    await expect(loadWithReload(() => Promise.resolve({ default: 1 }), { reload, storage: storage() })).resolves.toEqual({ default: 1 });
    expect(reload).not.toHaveBeenCalled();
  });
});
