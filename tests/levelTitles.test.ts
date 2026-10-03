import { describe, expect, it } from 'vitest';
import { LEVELS, titlesUpTo } from '@/config/progression';
import { createNewSave } from '@/domain/newAccount';
import { migrateSave } from '@/persistence/migrations';

const titleAt = (level: number) =>
  (LEVELS[level - 1].rewards.find((r) => r.kind === 'TITLE') as { title: string } | undefined)?.title;

describe('level titles', () => {
  it('are earned every 5 levels, each one different', () => {
    const levels = LEVELS.filter((l) => l.rewards.some((r) => r.kind === 'TITLE')).map((l) => l.level);
    expect(levels).toEqual([5, 10, 15, 20, 25, 30, 35, 40]);
    const titles = levels.map(titleAt);
    expect(new Set(titles).size).toBe(8);
    // The titles players already have keep their levels.
    expect([titleAt(10), titleAt(20), titleAt(30), titleAt(40)]).toEqual(['Shardseeker', 'Crownbreaker', 'Aether Warden', 'Sovereign of Shards']);
  });

  it('players past a new title level get it when the save loads, without changing their chosen title', () => {
    const save = createNewSave('T', 'flame', 0, 'p');
    save.profile.level = 22;
    save.profile.titles = ['Shardseeker', 'Crownbreaker'];
    save.profile.title = 'Crownbreaker';
    const { save: s } = migrateSave(JSON.parse(JSON.stringify(save)));
    expect([...s.profile.titles].sort()).toEqual([...titlesUpTo(22)].sort());
    expect(titlesUpTo(22)).toHaveLength(4);
    expect(s.profile.title).toBe('Crownbreaker');
  });
});
