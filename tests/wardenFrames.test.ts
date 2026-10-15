import { describe, expect, it } from 'vitest';
import { FRAME_WINS, activeFrame, chooseFrame } from '@/domain/frames';
import { createNewSave } from '@/domain/newAccount';
import { playerSide } from '@/domain/matchSetup';
import { migrateSave } from '@/persistence/migrations';
import { sanitizeRemoteSide, validateRemoteSide } from '@/net/lobby';
import { createGame } from '@/engine/game';

describe('Warden frames', () => {
  it('a faction frame is earned with 100 wins with it and then goes with any deck', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    expect(chooseFrame(save, 'EMBER').ok).toBe(false);
    save.profile.factionWins = { EMBER: FRAME_WINS - 1 };
    expect(chooseFrame(save, 'EMBER').ok).toBe(false);
    save.profile.factionWins = { EMBER: FRAME_WINS };
    const res = chooseFrame(save, 'EMBER');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(activeFrame(res.value)).toBe('EMBER');
    const side = playerSide(res.value.profile, res.value.decks.find((d) => d.heroFaction !== 'EMBER')!);
    expect(side.frame).toBe('EMBER');
    expect(createGame({ seed: 1, players: [side, { ...side, frame: null }] }).state.players[0].hero.frame).toBe('EMBER');
    expect(chooseFrame(res.value, null).ok).toBe(true);
  });

  it('survives a reload, drops junk, and online sides carry only a valid frame', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    save.profile.factionWins = { TIDE: 150 };
    save.profile.wardenFrame = 'TIDE';
    expect(migrateSave(JSON.parse(JSON.stringify(save))).save.profile.wardenFrame).toBe('TIDE');
    expect(migrateSave(JSON.parse(JSON.stringify({ ...save, profile: { ...save.profile, wardenFrame: 'GOLD' } }))).save.profile.wardenFrame).toBeNull();
    const side = playerSide(save.profile, save.decks[0]);
    expect(validateRemoteSide({ ...side, frame: 'NOPE' })).toBe('Invalid Warden frame.');
    expect(sanitizeRemoteSide(side).frame).toBe('TIDE');
  });
});
