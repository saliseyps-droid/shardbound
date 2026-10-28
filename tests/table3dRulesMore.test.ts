// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { approach, cardsDrawn, isEnemyUnit, ownerOf } from '@/ui/match/table3d/bodyRules';
import { ROOM, ZOOM, clampRoomPan, isEmptyTable, orbitTo, pinchZoom, zoomsTable } from '@/ui/match/table3d/tableInput';

const dom = (html: string) => {
  document.body.innerHTML = html;
  return document.body;
};

describe('3D bodies read the board right', () => {
  it('knows an enemy unit by its row, not only inside the enemy side', () => {
    dom('<section class="battlefield"><div class="board-row enemy"><div class="unit" id="e"></div></div><div class="board-row self"><div class="unit" id="s"></div></div></section>');
    expect(isEnemyUnit(document.getElementById('e')!)).toBe(true);
    expect(isEnemyUnit(document.getElementById('s')!)).toBe(false);
  });

  it('colours a crystal by the Warden it stands beside (also the co-op ally)', () => {
    dom('<div class="hero-area"><div data-entity="h:2"></div><div class="energy"><span class="crystal" id="c"></span></div></div>');
    expect(ownerOf(document.getElementById('c')!)).toBe(2);
  });

  it('lifts a card at the same speed at any frame rate', () => {
    let a = 0;
    for (let i = 0; i < 30; i++) a = approach(a, 1, 1 / 30, 12);
    let b = 0;
    for (let i = 0; i < 120; i++) b = approach(b, 1, 1 / 120, 12);
    expect(a).toBeCloseTo(b, 3);
  });

  it('flies one card per card drawn, none for a milled or discarded one', () => {
    expect(cardsDrawn({ deck: 20, hand: 4 }, { deck: 18, hand: 6 })).toBe(2);
    expect(cardsDrawn({ deck: 20, hand: 4 }, { deck: 19, hand: 4 })).toBe(0); // milled
    expect(cardsDrawn({ deck: 20, hand: 10 }, { deck: 19, hand: 10 })).toBe(0); // drawn into a full hand: burned
    expect(cardsDrawn({ deck: 20, hand: 4 }, { deck: 20, hand: 3 })).toBe(0); // played a card
    expect(cardsDrawn({ deck: 20, hand: 4 }, { deck: 12, hand: 12 })).toBe(5); // capped
  });
});

describe('3D table input', () => {
  it('zooms with the wheel over the table, not over other panels in the match', () => {
    const match = dom('<div class="match"><div class="table3d"><div class="table3d-plane"><div id="u"></div></div></div><div class="overlay-list" id="o"></div></div>').querySelector('.match') as HTMLElement;
    expect(zoomsTable(document.getElementById('u')!, match)).toBe(true);
    expect(zoomsTable(match, match)).toBe(true);
    expect(zoomsTable(document.getElementById('o')!, match)).toBe(false);
  });

  it('pinches to zoom in proportion to the finger spread, out far enough to see the room, in up to 3×', () => {
    expect(pinchZoom(100, 200, 1)).toBeCloseTo(2);
    expect(pinchZoom(100, 50, 1)).toBe(0.5);
    expect(pinchZoom(100, 10, 1)).toBe(ZOOM.min);
    expect(pinchZoom(100, 900, 1.5)).toBe(3);
    expect(ZOOM.min).toBeLessThanOrEqual(0.45); // as far out as the mockup
  });
});

describe('dragging on the table', () => {
  it('looks around from empty table, never from a unit, a Warden, a card in hand or a button', () => {
    dom('<div class="match"><div class="table3d"><div class="table3d-plane"><div class="battlefield" id="bf"><div class="unit" data-entity="u:1"><span id="stat"></span></div></div><div data-entity="h:1" id="h"></div><button id="b"></button></div></div><div class="hand"><div class="hand-card" id="c"></div></div></div>');
    const match = document.querySelector('.match')!;
    expect(isEmptyTable(document.getElementById('bf')!, match)).toBe(true);
    expect(isEmptyTable(match, match)).toBe(true);
    expect(isEmptyTable(document.getElementById('stat')!, match)).toBe(false);
    expect(isEmptyTable(document.getElementById('h')!, match)).toBe(false);
    expect(isEmptyTable(document.getElementById('b')!, match)).toBe(false);
    expect(isEmptyTable(document.getElementById('c')!, match)).toBe(false);
  });

  it('turns and tilts the view with the drag, within limits', () => {
    expect(orbitTo({ yaw: 0, tilt: 0.62 }, 100, 0)).toEqual({ yaw: -0.5, tilt: 0.62 });
    expect(orbitTo({ yaw: 0, tilt: 0.62 }, 0, 100).tilt).toBeCloseTo(1.02);
    // All the way around the table, as in the mockup's room.
    expect(orbitTo({ yaw: 3, tilt: 0.62 }, -200, 0).yaw).toBeCloseTo(4 - Math.PI * 2);
    expect(orbitTo({ yaw: 0, tilt: 0.62 }, 0, 10000).tilt).toBe(1.25);
    expect(orbitTo({ yaw: 0, tilt: 0.62 }, 0, -10000).tilt).toBe(0.12);
  });

  it('moves around the room, not only over the board, at any zoom', () => {
    expect(clampRoomPan(3, -2)).toEqual({ x: 3, y: -2 });
    expect(clampRoomPan(100, -100)).toEqual({ x: ROOM.x, y: -ROOM.y });
    expect(ROOM.x).toBeGreaterThan(8); // beyond the board's half width (8)
  });
});
