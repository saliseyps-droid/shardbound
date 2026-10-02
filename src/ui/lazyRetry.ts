import { lazy, type ComponentType } from 'react';

/**
 * Screens are separate files with content hashes in their names. After a deploy the old files are gone,
 * so a tab opened before it (or a cached index.html) fails to load a screen. Reloading once fetches the
 * new version; a flag in sessionStorage stops a reload loop if the file is really missing.
 */
const FLAG = 'shardbound.chunkReload';
/** How long a reload attempt counts before another one is allowed. */
const WINDOW_MS = 30_000;

interface Deps {
  reload: () => void;
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  now?: () => number;
}

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk \S+ failed/i.test(message);
}

export function loadWithReload<T>(factory: () => Promise<T>, deps: Deps): Promise<T> {
  const now = deps.now ?? Date.now;
  return factory().catch((error: unknown) => {
    if (!isChunkLoadError(error)) throw error;
    let last = 0;
    try {
      last = Number(deps.storage.getItem(FLAG)) || 0;
    } catch {
      /* storage blocked */
    }
    if (now() - last < WINDOW_MS) throw error; // already reloaded once: show the error screen
    try {
      deps.storage.setItem(FLAG, String(now()));
    } catch {
      /* storage blocked */
    }
    deps.reload();
    // Keep the screen suspended until the page reloads.
    return new Promise<T>(() => undefined);
  });
}

const browserDeps = (): Deps => ({ reload: () => location.reload(), storage: sessionStorage });

/** React.lazy that recovers from screen files removed by a newer deploy. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithReload<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() => loadWithReload(factory, browserDeps()));
}

/** Vite's own preload failures (CSS/JS dependencies of a screen) go the same way. */
export function installPreloadRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    const deps = browserDeps();
    let last = 0;
    try {
      last = Number(deps.storage.getItem(FLAG)) || 0;
    } catch {
      /* storage blocked */
    }
    if (Date.now() - last < WINDOW_MS) return;
    event.preventDefault();
    try {
      deps.storage.setItem(FLAG, String(Date.now()));
    } catch {
      /* storage blocked */
    }
    deps.reload();
  });
}
