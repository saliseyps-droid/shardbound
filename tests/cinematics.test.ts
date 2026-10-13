import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CINEMATICS } from '@/data/cinematics';
import { CAMPAIGNS, allEncounters } from '@/data/opponents';
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

describe('boss cinematics and music', () => {
  it('Sali is preceded by his throne, with art, Czech text and music', () => {
    const cs = csMeta as Record<string, string>;
    const sali = allEncounters().find((e) => e.id === 'v3_final')!;
    const def = CINEMATICS[sali.preCinematic!];
    expect(def.shots).toHaveLength(1);
    expect(existsSync(`src/assets/cinematics/${def.shots[0].image}.webp`)).toBe(true);
    expect(cs[def.title] && cs[def.shots[0].text]).toBeTruthy();
    for (const e of allEncounters()) if (e.preCinematic) expect(CINEMATICS[e.preCinematic], e.id).toBeTruthy();
  });

  it('every cinematic with music points at a track that exists, each starting somewhere else', () => {
    const starts = Object.values(CINEMATICS).map((c) => c.music!);
    for (const m of starts) expect(existsSync(`src/assets/music/${m.track}.mp3`)).toBe(true);
    expect(new Set(starts.map((m) => m.at)).size).toBe(starts.length);
  });
});
