import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CINEMATICS } from '@/data/cinematics';
import { CAMPAIGNS } from '@/data/opponents';
import { migrateSave } from '@/persistence/migrations';
import { createNewSave } from '@/domain/newAccount';
import csMeta from '@/i18n/cs/ui/meta';

describe('campaign cinematics', () => {
  it('every campaign intro and outro exists, with art and Czech text for every line', () => {
    const cs = csMeta as Record<string, string>;
    for (const c of CAMPAIGNS) {
      for (const id of [c.intro, c.outro].filter(Boolean) as string[]) {
        const def = CINEMATICS[id];
        expect(def, `${c.id} ${id}`).toBeTruthy();
        expect(cs[def.title], def.title).toBeTruthy();
        expect(def.shots.length).toBeGreaterThanOrEqual(3);
        for (const s of def.shots) {
          expect(existsSync(`src/assets/cinematics/${s.image}.webp`), s.image).toBe(true);
          expect(cs[s.text], s.text).toBeTruthy();
          expect(s.ms).toBeGreaterThanOrEqual(3000);
        }
      }
    }
    expect(CAMPAIGNS.find((c) => c.id === 'lamp')).toMatchObject({ intro: 'lamp_intro', outro: 'lamp_outro' });
  });

  it('remembers which cinematics were seen across a reload', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    save.pve.seenCinematics = ['lamp_intro'];
    expect(migrateSave(JSON.parse(JSON.stringify(save))).save.pve.seenCinematics).toEqual(['lamp_intro']);
  });
});
