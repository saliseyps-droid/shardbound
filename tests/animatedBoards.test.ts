import { describe, expect, it } from 'vitest';
import { createNewSave } from '@/domain/newAccount';
import { activeBoard, boardOwnedBy, chooseBoard } from '@/domain/boards';
import { INFERNO_BOARDS, pickBoardBackground } from '@/ui/match/boardBackgrounds';

describe('animated boards', () => {
  const fresh = () => createNewSave('Tester', 'ember', 0, 'p1');
  const beatAzgaroth = () => {
    const s = fresh();
    return { ...s, pve: { ...s.pve, completed: { ...s.pve.completed, u4_boss: { firstClearAt: 1, wins: 1 } } } };
  };

  it('campaign boards are earned by beating Azgaroth', () => {
    expect(boardOwnedBy(fresh(), 'inferno-board-1')).toBe(false);
    expect(chooseBoard(fresh(), 'inferno-board-1').ok).toBe(false);
    const res = chooseBoard(beatAzgaroth(), 'inferno-board-1');
    expect(res.ok && activeBoard(res.value)).toBe('inferno-board-1');
    expect(chooseBoard(beatAzgaroth(), 'nope').ok).toBe(false);
  });

  it('is used outside campaigns with mats of their own', () => {
    expect(pickBoardBackground({ board: 'inferno-board-1' })).toMatchObject({ url: INFERNO_BOARDS[0], key: 'inferno-board-1' });
    expect(pickBoardBackground({ campaign: 'main', board: 'inferno-board-1' })?.key).toBe('inferno-board-1');
    expect(pickBoardBackground({ campaign: 'inn', board: 'inferno-board-1' })?.key).toMatch(/^inn-board/);
  });
});

describe('board effects', () => {
  it('every board has an effect and every mat a board', async () => {
    const { BOARDS } = await import('@/domain/boards');
    const { BOARD_FX } = await import('@/ui/match/boardFx');
    const { BOARD_MATS } = await import('@/ui/match/boardBackgrounds');
    expect(Object.keys(BOARD_MATS).sort()).toEqual(BOARDS.map((b) => b.id).sort());
    for (const b of BOARDS) expect(BOARD_FX[b.id], b.id).toBeDefined();
  });

  it('the general mats are free', () => {
    const s = createNewSave('Tester', 'ember', 0, 'p1');
    expect(chooseBoard(s, 'board-10').ok).toBe(true);
  });
});
