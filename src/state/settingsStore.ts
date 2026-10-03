import { create } from 'zustand';

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  /** Separate switches for the background music and the sound effects. */
  musicMuted: boolean;
  sfxMuted: boolean;
  /** 0.5 = fast, 1 = normal, 1.5 = slow. */
  animationSpeed: number;
  reducedMotion: boolean;
  confirmEndTurn: boolean;
  performanceMode: boolean;
  turnTimer: boolean;
  language: string;
  showDamageNumbers: boolean;
  /** Volume scale the sliders were saved under (2 = full slider is about half the old loudness). */
  volumeScale?: number;
}

export const DEFAULT_SETTINGS: Settings = {
  // Full sliders: src/audio/audioService.ts plays them at about half the raw loudness.
  masterVolume: 1,
  musicVolume: 0.8,
  sfxVolume: 1,
  muted: false,
  musicMuted: false,
  sfxMuted: false,
  animationSpeed: 1,
  reducedMotion: false,
  confirmEndTurn: false,
  performanceMode: false,
  turnTimer: true,
  language: 'en',
  showDamageNumbers: true,
  volumeScale: 2,
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
    // Volumes saved under the old scale would now be half as loud: start them from the new defaults once.
    if (parsed.volumeScale !== DEFAULT_SETTINGS.volumeScale) {
      const { masterVolume, musicVolume, sfxVolume, volumeScale } = DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...parsed, masterVolume, musicVolume, sfxVolume, volumeScale };
    }
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
