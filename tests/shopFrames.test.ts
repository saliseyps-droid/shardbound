import { describe, expect, it } from 'vitest';
import { SHOP_FRAMES } from '@/data/shopFrames';
import { activeFrame, buyFrame, chooseFrame, FRAME_WINS } from '@/domain/frames';
import { createNewSave } from '@/domain/newAccount';
import { playerSide } from '@/domain/matchSetup';
import { validateRemoteSide as validateSide } from '@/net/lobby';
import { migrateSave } from '@/persistence/migrations';
import { SHOP_FRAME_DESIGNS } from '@/ui/components/frames/ShopFrames';

describe('Shop frames', () => {
  it('sells four frames for any faction, two still at 2500 Gold and two animated at 5000', () => {
    expect(SHOP_FRAMES.map((f) => [f.id, f.price, f.animated])).toEqual([
      ['obsidian', 2500, false],
      ['royal', 2500, false],
      ['aurora', 5000, true],
      ['wings', 5000, true],
    ]);
    for (const f of SHOP_FRAMES) expect(SHOP_FRAME_DESIGNS[f.id], f.id).toBeDefined();
  });

  it('is bought with Gold, worn at once and can be swapped with a faction frame', () => {
    let s = createNewSave('A', 'flame', 1, 'p');
    s.profile.gold = 3000;
    expect(chooseFrame(s, 'royal').ok).toBe(false);
    expect(buyFrame(s, 'aurora', 2).ok).toBe(false);
    const r = buyFrame(s, 'royal', 2);
    if (!r.ok) throw new Error(r.error);
    s = r.value;
    expect(s.profile.gold).toBe(500);
    expect(s.profile.ownedFrames).toEqual(['royal']);
    expect(activeFrame(s)).toBe('royal');
    expect(buyFrame(s, 'royal', 3).ok).toBe(false);
    // Any faction's deck wears it.
    for (const d of s.decks) expect(playerSide(s.profile, d).frame).toBe('royal');
    s.profile.factionWins = { EMBER: FRAME_WINS };
    const e = chooseFrame(s, 'EMBER');
    expect(e.ok && activeFrame(e.value)).toBe('EMBER');
    const back = chooseFrame(s, 'royal');
    expect(back.ok && activeFrame(back.value)).toBe('royal');
  });

  it('survives a reload and travels to online opponents', () => {
    const s = createNewSave('A', 'flame', 1, 'p');
    s.profile.ownedFrames = ['wings', 'nonsense', 'wings'];
    s.profile.wardenFrame = 'wings';
    const m = migrateSave(JSON.parse(JSON.stringify(s)));
    const save = m.save;
    expect(save.profile.ownedFrames).toEqual(['wings']);
    expect(activeFrame(save)).toBe('wings');
    const side = playerSide(save.profile, save.decks[0]);
    expect(validateSide(side)).toBeNull();
    expect(validateSide({ ...side, frame: 'not-a-frame' })).not.toBeNull();
  });
});
