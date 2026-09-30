import { create } from 'zustand';

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  /** 0.5 = fast, 1 = normal, 1.5 = slow. */
  animationSpeed: number;
  reducedMotion: boolean;
  confirmEndTurn: boolean;
  performanceMode: boolean;
  turnTimer: boolean;
  language: string;
  showDamageNumbers: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.8,
  musicVolume: 0.45,
  sfxVolume: 0.8,
  muted: false,
  animationSpeed: 1,
  reducedMotion: false,
  confirmEndTurn: false,
  performanceMode: false,
  turnTimer: true,
  language: 'en',
  showDamageNumbers: true,
};

const KEY = 'shardbound.settings.v1';

/** Settings are small and needed synchronously at boot, so they live in localStorage. */
function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const prefersReduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      return { ...DEFAULT_SETTINGS, reducedMotion: prefersReduced };
    }
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

interface SettingsStore extends Settings {
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettings = create<SettingsStore>((set, get) => ({
  ...load(),
  update: (patch) => {
    set(patch);
    try {
      const { update: _u, reset: _r, ...values } = { ...get(), ...patch };
      localStorage.setItem(KEY, JSON.stringify(values));
    } catch {
      /* storage unavailable: settings stay in memory */
    }
  },
  reset: () => {
    set({ ...DEFAULT_SETTINGS });
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
}));

/** Duration helper honouring animation speed and reduced motion. */
export function anim(ms: number): number {
  const s = useSettings.getState();
  if (s.reducedMotion) return Math.min(ms, 120) * 0.5;
  return ms * s.animationSpeed;
}
