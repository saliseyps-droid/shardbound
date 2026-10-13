import { describe, expect, it } from 'vitest';
import { LAMP_LEGENDS, getAchievement, innGuestCards } from '@/data/achievements';
import { evaluateAchievements } from '@/domain/achievements';
import { createNewSave } from '@/domain/newAccount';
import { addCards, type GameSave } from '@/domain/save';
import { INN_CAMPAIGN, LAMP_CAMPAIGN } from '@/data/opponents';

const fresh = (): GameSave => createNewSave('Tester', 'flame', 1, 'p1');
const clear = (s: GameSave, ids: string[]): GameSave => ({ ...s, pve: { ...s.pve, completed: { ...s.pve.completed, ...Object.fromEntries(ids.map((id) => [id, { firstClearAt: 1, wins: 1 }])) } } });
const own = (s: GameSave, ids: string[]): GameSave => ({ ...s, collection: addCards(s.collection, ids.map((cardId) => ({ cardId, variant: 'NORMAL' as const }))) });
const ids = (chapters: typeof LAMP_CAMPAIGN, i: number) => chapters[i].encounters.map((e) => e.id);

describe("Achievements for The Lamplighters' Road and The Wraithwood Inn", () => {
  it('none of them is unlocked on a new account', () => {
    const got = evaluateAchievements(fresh());
    for (const id of ['lamp_ch1', 'lamp_oblivia', 'lamp_legends', 'inn_first', 'inn_ch2', 'inn_host', 'inn_guests']) expect(got, id).not.toContain(id);
  });

  it('campaign goals follow the cleared fights', () => {
    expect(evaluateAchievements(clear(fresh(), ids(LAMP_CAMPAIGN, 0)))).toContain('lamp_ch1');
    expect(evaluateAchievements(clear(fresh(), ['l3_boss']))).toContain('lamp_oblivia');
    expect(evaluateAchievements(clear(fresh(), ['w1_e1']))).toContain('inn_first');
    expect(evaluateAchievements(clear(fresh(), ids(INN_CAMPAIGN, 1).slice(0, 2)))).not.toContain('inn_ch2');
    expect(evaluateAchievements(clear(fresh(), ids(INN_CAMPAIGN, 1)))).toContain('inn_ch2');
    expect(evaluateAchievements(clear(fresh(), ['w4_boss']))).toContain('inn_host');
  });

  it('collection goals need every campaign card', () => {
    expect(innGuestCards()).toHaveLength(12);
    expect(evaluateAchievements(own(fresh(), LAMP_LEGENDS))).toContain('lamp_legends');
    expect(evaluateAchievements(own(fresh(), innGuestCards().slice(1)))).not.toContain('inn_guests');
    expect(evaluateAchievements(own(fresh(), innGuestCards()))).toContain('inn_guests');
    expect(getAchievement('inn_guests')!.rewards).toContainEqual({ kind: 'TITLE', title: 'Innkeeper' });
  });
});
