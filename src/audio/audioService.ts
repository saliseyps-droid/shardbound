import { useSettings } from '@/state/settingsStore';

export type SoundEvent =
  | 'click'
  | 'hover'
  | 'draw'
  | 'play'
  | 'spell'
  | 'attack'
  | 'hit'
  | 'heal'
  | 'death'
  | 'buff'
  | 'freeze'
  | 'shield'
  | 'packOpen'
  | 'reveal'
  | 'rareReveal'
  | 'epicReveal'
  | 'legendaryReveal'
  | 'victory'
  | 'defeat'
  | 'turn'
  | 'endTurn'
  | 'error'
  | 'coin'
  | 'levelUp';

interface Tone {
  freq: number;
  to?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  noise?: boolean;
}

/** Synthesized recipes: used for events without recorded samples, as a fallback, and as layers. */
const RECIPES: Record<SoundEvent, Tone[]> = {
  // Button clicks are silent on purpose (players found them noisy).
  click: [],
  hover: [{ freq: 900, dur: 0.025, type: 'sine', gain: 0.06 }],
  draw: [{ freq: 380, to: 760, dur: 0.12, type: 'triangle', gain: 0.18 }, { noise: true, freq: 4000, dur: 0.08, gain: 0.05 }],
  play: [{ freq: 220, to: 140, dur: 0.18, type: 'sine', gain: 0.35 }, { noise: true, freq: 900, dur: 0.12, gain: 0.12 }],
  spell: [{ freq: 520, to: 1280, dur: 0.35, type: 'sawtooth', gain: 0.1 }, { freq: 780, to: 1560, dur: 0.3, type: 'sine', gain: 0.12, delay: 0.05 }],
  attack: [{ noise: true, freq: 1600, dur: 0.12, gain: 0.25 }, { freq: 180, to: 90, dur: 0.15, type: 'square', gain: 0.12 }],
  hit: [{ freq: 140, to: 60, dur: 0.16, type: 'square', gain: 0.22 }, { noise: true, freq: 700, dur: 0.1, gain: 0.2 }],
  heal: [{ freq: 520, to: 780, dur: 0.25, type: 'sine', gain: 0.18 }, { freq: 780, to: 1040, dur: 0.25, type: 'sine', gain: 0.12, delay: 0.08 }],
  death: [{ freq: 300, to: 60, dur: 0.45, type: 'sawtooth', gain: 0.12 }, { noise: true, freq: 400, dur: 0.35, gain: 0.12 }],
  buff: [{ freq: 440, to: 880, dur: 0.18, type: 'triangle', gain: 0.18 }],
  freeze: [{ freq: 1800, to: 2600, dur: 0.25, type: 'sine', gain: 0.08 }, { noise: true, freq: 6000, dur: 0.25, gain: 0.08 }],
  shield: [{ freq: 1200, to: 900, dur: 0.2, type: 'triangle', gain: 0.15 }],
  packOpen: [{ noise: true, freq: 2200, dur: 0.25, gain: 0.06 }],
  reveal: [{ noise: true, freq: 3000, dur: 0.06, gain: 0.04 }],
  rareReveal: [{ freq: 880, dur: 0.45, type: 'sine', gain: 0.05 }],
  epicReveal: [
    { freq: 660, dur: 0.5, type: 'sine', gain: 0.05 },
    { freq: 990, dur: 0.6, type: 'sine', gain: 0.045, delay: 0.09 },
  ],
  legendaryReveal: [
    { freq: 523, dur: 0.7, type: 'sine', gain: 0.05 },
    { freq: 784, dur: 0.8, type: 'sine', gain: 0.05, delay: 0.1 },
    { freq: 1046, dur: 1.0, type: 'sine', gain: 0.045, delay: 0.2 },
  ],
  victory: [
    { freq: 523, dur: 0.2, type: 'triangle', gain: 0.22 },
    { freq: 659, dur: 0.2, type: 'triangle', gain: 0.22, delay: 0.18 },
    { freq: 784, dur: 0.2, type: 'triangle', gain: 0.22, delay: 0.36 },
    { freq: 1046, dur: 0.7, type: 'triangle', gain: 0.25, delay: 0.54 },
  ],
  defeat: [
    { freq: 392, dur: 0.35, type: 'sine', gain: 0.2 },
    { freq: 330, dur: 0.35, type: 'sine', gain: 0.2, delay: 0.3 },
    { freq: 262, dur: 0.9, type: 'sine', gain: 0.22, delay: 0.6 },
  ],
  turn: [{ freq: 440, dur: 0.12, type: 'sine', gain: 0.18 }, { freq: 660, dur: 0.2, type: 'sine', gain: 0.18, delay: 0.1 }],
  // Fallback until the recorded book-close sound has loaded.
  endTurn: [{ freq: 180, to: 120, dur: 0.12, type: 'triangle', gain: 0.06 }],
  error: [{ freq: 200, dur: 0.12, type: 'square', gain: 0.1 }, { freq: 150, dur: 0.15, type: 'square', gain: 0.1, delay: 0.1 }],
  coin: [{ freq: 1320, dur: 0.08, type: 'square', gain: 0.08 }, { freq: 1760, dur: 0.16, type: 'square', gain: 0.08, delay: 0.07 }],
  levelUp: [
    { freq: 392, dur: 0.15, type: 'triangle', gain: 0.2 },
    { freq: 523, dur: 0.15, type: 'triangle', gain: 0.2, delay: 0.12 },
    { freq: 659, dur: 0.15, type: 'triangle', gain: 0.2, delay: 0.24 },
    { freq: 784, dur: 0.5, type: 'triangle', gain: 0.24, delay: 0.36 },
  ],
};

/**
 * Recorded effects (CC0, see src/assets/sfx/CREDITS.md): sword swings, slashes, cards, coins.
 * Each event picks a random variant at a slightly random pitch so repeats don't sound identical.
 * `layer` also plays the synthesized recipe underneath (e.g. a low tone under a body falling).
 * Events without samples, or before the samples have loaded, use the synthesized recipe.
 */
const SAMPLE_URLS = import.meta.glob('../assets/sfx/*.wav', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const SAMPLES: Partial<Record<SoundEvent, { prefix: string; gain: number; layer?: boolean }>> = {
  attack: { prefix: 'attack', gain: 0.4 },
  hit: { prefix: 'hit', gain: 0.35 },
  draw: { prefix: 'draw', gain: 0.25 },
  // Playing a card: the same soft card flip as the pack reveals.
  play: { prefix: 'draw', gain: 0.22 },
  spell: { prefix: 'spell', gain: 0.3 },
  shield: { prefix: 'shield', gain: 0.22 },
  coin: { prefix: 'coin', gain: 0.3 },
  endTurn: { prefix: 'endturn', gain: 0.2 },
  death: { prefix: 'death', gain: 0.4, layer: true },
  packOpen: { prefix: 'pack', gain: 0.3 },
  // Card reveals in packs: a quiet card flip; rarer cards add a soft chime underneath.
  reveal: { prefix: 'draw', gain: 0.18 },
  rareReveal: { prefix: 'draw', gain: 0.18, layer: true },
  epicReveal: { prefix: 'draw', gain: 0.18, layer: true },
  legendaryReveal: { prefix: 'draw', gain: 0.2, layer: true },
};

/** Loudness at full sliders, relative to the raw sounds. */
const VOLUME_SCALE = 0.5;
/** The background music plays at half volume during matches. */
const MATCH_MUSIC = 0.5;

/** Ambient generative music: slow pads over a minor pentatonic scale. */
const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];

class AudioService {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private musicWanted = false;
  private lastPlayed = new Map<SoundEvent, number>();
  /** Decoded recorded effects by event (filled in the background after unlock). */
  private buffers = new Map<SoundEvent, AudioBuffer[]>();
  private samplesRequested = false;
  private inMatch = false;

  private loadSamples() {
    if (this.samplesRequested || !this.ctx) return;
    this.samplesRequested = true;
    const ctx = this.ctx;
    for (const [event, def] of Object.entries(SAMPLES) as [SoundEvent, { prefix: string }][]) {
      const urls = Object.entries(SAMPLE_URLS)
        .filter(([path]) => new RegExp(`/${def.prefix}\\d+\\.wav$`).test(path))
        .map(([, url]) => url);
      void Promise.all(
        urls.map((url) =>
          fetch(url)
            .then((r) => r.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data))
            .catch(() => null),
        ),
      ).then((decoded) => {
        const ok = decoded.filter((b): b is AudioBuffer => !!b);
        if (ok.length) this.buffers.set(event, ok);
      });
    }
  }

  private playSample(event: SoundEvent): boolean {
    const def = SAMPLES[event];
    const list = this.buffers.get(event);
    if (!def || !list?.length || !this.ctx || !this.sfxGain) return false;
    const src = this.ctx.createBufferSource();
    src.buffer = list[Math.floor(Math.random() * list.length)];
    src.playbackRate.value = 0.94 + Math.random() * 0.12;
    const gain = this.ctx.createGain();
    gain.gain.value = def.gain;
    src.connect(gain).connect(this.sfxGain);
    src.start();
    return !def.layer;
  }

  constructor() {
    useSettings.subscribe(() => this.applyVolumes());
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.musicGain.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.applyVolumes();
      this.loadSamples();
      if (this.musicWanted) this.startMusicLoop();
    } catch (e) {
      console.warn('[audio] unavailable', e);
      this.ctx = null;
    }
  }

  private applyVolumes() {
    if (!this.ctx || !this.sfxGain || !this.musicGain) return;
    const s = useSettings.getState();
    // Full sliders play at about half the raw loudness (see DEFAULT_SETTINGS).
    const master = s.muted ? 0 : s.masterVolume * VOLUME_SCALE;
    const sfx = s.sfxMuted ? 0 : master * s.sfxVolume;
    const music = s.musicMuted ? 0 : master * s.musicVolume * 0.35 * (this.inMatch ? MATCH_MUSIC : 1);
    this.sfxGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.02);
    this.musicGain.gain.setTargetAtTime(music, this.ctx.currentTime, 0.2);
  }

  play(event: SoundEvent) {
    if (!this.ctx || !this.sfxGain) return;
    const s = useSettings.getState();
    if (s.muted || s.sfxMuted || s.masterVolume === 0 || s.sfxVolume === 0) return;
    // Throttle identical sounds (e.g. area damage) to avoid clipping.
    const nowMs = performance.now();
    if (nowMs - (this.lastPlayed.get(event) ?? 0) < 45) return;
    this.lastPlayed.set(event, nowMs);
    if (this.playSample(event)) return;
    const t0 = this.ctx.currentTime;
    for (const tone of RECIPES[event]) this.playTone(tone, t0, this.sfxGain);
  }

  private playTone(tone: Tone, t0: number, out: AudioNode) {
    const ctx = this.ctx!;
    const start = t0 + (tone.delay ?? 0);
    const end = start + tone.dur;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.gain ?? 0.2, start + Math.min(0.02, tone.dur / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    gain.connect(out);
    if (tone.noise && this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = tone.freq;
      src.connect(filter).connect(gain);
      src.start(start);
      src.stop(end + 0.05);
    } else {
      const osc = ctx.createOscillator();
      osc.type = tone.type ?? 'sine';
      osc.frequency.setValueAtTime(tone.freq, start);
      if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, end);
      osc.connect(gain);
      osc.start(start);
      osc.stop(end + 0.05);
    }
  }

  /** Matches play the music quieter (see MATCH_MUSIC). */
  setInMatch(inMatch: boolean) {
    this.inMatch = inMatch;
    this.applyVolumes();
  }

  startMusic() {
    this.musicWanted = true;
    if (this.ctx) this.startMusicLoop();
  }

  stopMusic() {
    this.musicWanted = false;
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  private startMusicLoop() {
    if (this.musicTimer !== null || !this.ctx || !this.musicGain) return;
    let step = 0;
    const playChord = () => {
      if (!this.ctx || !this.musicGain) return;
      const s = useSettings.getState();
      if (s.muted || s.musicMuted || s.musicVolume === 0) return;
      const t0 = this.ctx.currentTime;
      const root = SCALE[(step * 3) % SCALE.length] / 2;
      for (const [i, mult] of [1, 1.5, 2.0, 2.5].entries()) {
        this.playTone({ freq: root * mult, dur: 5.5, type: i === 0 ? 'triangle' : 'sine', gain: 0.05, delay: i * 0.4 }, t0, this.musicGain);
      }
      if (step % 2 === 0) {
        const melody = SCALE[(step * 5 + 2) % SCALE.length];
        this.playTone({ freq: melody, dur: 1.6, type: 'sine', gain: 0.04, delay: 2.2 }, t0, this.musicGain);
      }
      step++;
    };
    playChord();
    this.musicTimer = window.setInterval(playChord, 5000);
  }
}

export const audio = new AudioService();
