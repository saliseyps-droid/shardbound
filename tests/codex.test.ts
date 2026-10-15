import { describe, expect, it } from 'vitest';
import { codexEntries, codexParts } from '@/ui/codex/codexEntries';
import { createNewSave } from '@/domain/newAccount';
import { CAMPAIGNS } from '@/data/opponents';

describe('Codex', () => {
  it('tells the story in order: the world, then every campaign with its chapters, bosses and cinematics', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const entries = codexEntries(save);
    expect(entries[0].id).toBe('world_intro:0');
    expect(codexParts(entries).map((p) => p.id)).toEqual(['world', ...CAMPAIGNS.map((c) => c.id)]);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    // Sali's throne comes right before Sali.
    const sali = entries.findIndex((e) => e.id === 'v3_final');
    expect(entries[sali - 1].cinematic).toBe('sali_throne');
  });

  it('pages open as the player gets there', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const open = (s: typeof save, id: string) => codexEntries(s).find((e) => e.id === id)!.unlocked;
    expect(open(save, 'world_intro:0')).toBe(false);
    expect(open(save, 'ch1')).toBe(true);
    expect(open(save, 'c1_boss')).toBe(false);
    save.pve.seenCinematics = ['world_intro'];
    save.pve.completed = { c1_boss: { firstClearAt: 5, wins: 2 } };
    expect(open(save, 'world_intro:4')).toBe(true);
    const boss = codexEntries(save).find((e) => e.id === 'c1_boss')!;
    expect(boss.unlocked && boss.beaten).toEqual({ at: 5, wins: 2 });
    // Paid chapters stay blank until bought or reached.
    expect(open(save, 'lr1')).toBe(false);
  });
});
