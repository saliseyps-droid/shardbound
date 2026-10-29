// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { DECOR, DECOR_BY_ID, DEFAULT_ROOM, SLOTS, SLOT_KIND, decorFor, ownsDecor, sanitizeRoom, slotOf } from '@/data/lounge';

describe('lounge catalogue', () => {
  it('has unique ids', () => {
    expect(new Set(DECOR.map((d) => d.id)).size).toBe(DECOR.length);
  });

  it('gives every default slot a free piece of its kind', () => {
    for (const slot of SLOTS) {
      const id = DEFAULT_ROOM[slot];
      if (id === null) continue;
      expect(DECOR_BY_ID[id].kind).toBe(SLOT_KIND[slot]);
      expect(DECOR_BY_ID[id].price).toBe(0);
    }
  });

  it('offers every slot at least one piece', () => {
    for (const slot of SLOTS) expect(decorFor(slot).length).toBeGreaterThan(0);
  });

  it('counts free defaults as owned', () => {
    expect(ownsDecor([], 't_tavern')).toBe(true);
    expect(ownsDecor([], 't_marble')).toBe(false);
    expect(ownsDecor(['t_marble'], 't_marble')).toBe(true);
  });
});

describe('sanitizeRoom', () => {
  it('fills a missing or broken layout with the default room', () => {
    expect(sanitizeRoom(undefined)).toEqual(DEFAULT_ROOM);
    expect(sanitizeRoom('nope')).toEqual(DEFAULT_ROOM);
  });

  it('keeps owned pieces in their slots', () => {
    const room = sanitizeRoom({ table: 't_marble', furnLeft: 'fu_wine' }, ['t_marble', 'fu_wine']);
    expect(room.table).toBe('t_marble');
    expect(room.furnLeft).toBe('fu_wine');
  });

  it('drops pieces the player does not own', () => {
    expect(sanitizeRoom({ table: 't_marble' }, []).table).toBe('t_tavern');
  });

  it('checks a host room against the catalogue only', () => {
    expect(sanitizeRoom({ table: 't_marble' }).table).toBe('t_marble');
  });

  it('drops unknown pieces and pieces of the wrong kind', () => {
    const room = sanitizeRoom({ table: 'x_unknown', floor: 't_marble' }, ['t_marble']);
    expect(room.table).toBe('t_tavern');
    expect(room.floor).toBe('f_stone');
  });

  it('lets a piece stand in one slot only', () => {
    const room = sanitizeRoom({ furnLeft: 'fu_wine', furnRight: 'fu_wine' }, ['fu_wine']);
    expect(room.furnLeft).toBe('fu_wine');
    expect(room.furnRight).toBeNull();
  });

  it('empties optional slots but never the table, floor, walls, rug or lights', () => {
    const room = sanitizeRoom({ painting: null, table: null, lights: null });
    expect(room.painting).toBeNull();
    expect(room.table).toBe('t_tavern');
    expect(room.lights).toBe('l_torch');
  });

  it('finds the slot a piece stands in', () => {
    expect(slotOf({ ...DEFAULT_ROOM, furnRight: 'fu_plant' }, 'fu_plant')).toBe('furnRight');
    expect(slotOf(DEFAULT_ROOM, 'fu_plant')).toBeNull();
  });
});

describe('room decor', () => {
  it('can build every piece in the catalogue', async () => {
    const { hasBuilder } = await import('@/ui/lounge/decor/roomDecor');
    expect(DECOR.filter((d) => !hasBuilder(d.id)).map((d) => d.id)).toEqual([]);
  }, 30000);
});

describe('room decor builders', () => {
  it('build every piece without an error', async () => {
    // jsdom has no 2D canvas: a context that swallows every drawing call.
    const sink: unknown = new Proxy(function () {}, { get: (_t, k) => (k === 'canvas' ? document.createElement('canvas') : sink), apply: () => sink, set: () => true });
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = (() => sink) as unknown as typeof orig;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const THREE = await import('three');
      const { buildRoomDecor } = await import('@/ui/lounge/decor/roomDecor');
      const { SLOT_KIND } = await import('@/data/lounge');
      for (const d of DECOR) {
        const slot = SLOTS.find((s) => SLOT_KIND[s] === d.kind)!;
        const scene = new THREE.Scene();
        const room = buildRoomDecor(scene, { ...DEFAULT_ROOM, [slot]: d.id }, { tableW: 26.2, tableH: 12.6, art: () => undefined });
        room.update(1, 0.016);
        room.dispose();
      }
      expect(warn.mock.calls.map((c) => String(c[0]))).toEqual([]);
    } finally {
      HTMLCanvasElement.prototype.getContext = orig;
      warn.mockRestore();
    }
  }, 60000);
});
