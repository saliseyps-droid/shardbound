import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, CAT_LEGENDS } from '@/data/achievements';
import { hasCard } from '@/data/cards';
import { createNewSave } from '@/domain/newAccount';
import { addCards } from '@/domain/save';

describe('Fluffseeker', () => {
  const def = ACHIEVEMENTS.find((a) => a.id === 'cat_legends')!;
  it('counts the four cat Legendaries and grants the Fluffseeker title', () => {
    expect(CAT_LEGENDS.every(hasCard)).toBe(true);
    expect(def.rewards).toContainEqual({ kind: 'TITLE', title: 'Fluffseeker' });
    let save = createNewSave('A', 'flame', 1, 'p');
    expect(def.progress!(save)).toEqual({ current: 0, target: 4 });
    save = { ...save, collection: addCards(save.collection, CAT_LEGENDS.slice(0, 3).map((cardId) => ({ cardId, variant: 'NORMAL' as const }))) };
    expect(def.progress!(save)).toEqual({ current: 3, target: 4 });
    save = { ...save, collection: addCards(save.collection, [{ cardId: CAT_LEGENDS[3], variant: 'PRISMATIC' }]) };
    expect(def.progress!(save)).toEqual({ current: 4, target: 4 });
  });
});
