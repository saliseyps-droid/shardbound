const KEY = 'shardbound.introSeen';

/** Whether this browser has already shown the world intro cinematic (it plays once before the first Warden). */
export function introSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}
