// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = 'shardbound.settings.v1';
const load = async () => {
  vi.resetModules();
  return (await import('@/state/settingsStore')).useSettings.getState();
};

describe('volume settings', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to full sliders (the audio scales them to about half loudness)', async () => {
    const s = await load();
    expect([s.masterVolume, s.musicVolume, s.sfxVolume]).toEqual([1, 0.8, 1]);
  });

  it('resets volumes saved under the old scale once, keeping other settings', async () => {
    localStorage.setItem(KEY, JSON.stringify({ masterVolume: 0.8, musicVolume: 0.45, sfxVolume: 0.8, turnTimer: false }));
    const s = await load();
    expect([s.masterVolume, s.musicVolume, s.sfxVolume]).toEqual([1, 0.8, 1]);
    expect(s.turnTimer).toBe(false);
  });

  it('keeps volumes chosen under the new scale', async () => {
    localStorage.setItem(KEY, JSON.stringify({ masterVolume: 0.6, musicVolume: 0.3, sfxVolume: 0.9, volumeScale: 2 }));
    const s = await load();
    expect([s.masterVolume, s.musicVolume, s.sfxVolume]).toEqual([0.6, 0.3, 0.9]);
  });
});

describe('separate music / sound switches', () => {
  beforeEach(() => localStorage.clear());

  it('are on by default and survive older saves', async () => {
    localStorage.setItem(KEY, JSON.stringify({ volumeScale: 2, muted: false }));
    const s = await load();
    expect([s.musicMuted, s.sfxMuted]).toEqual([false, false]);
  });

  it('are remembered', async () => {
    (await load()).update({ musicMuted: true });
    const s = await load();
    expect([s.musicMuted, s.sfxMuted]).toEqual([true, false]);
  });
});
