import { describe, expect, it } from 'vitest';
import { PATCH_NOTES } from '@/data/patchNotes';

describe('patch notes', () => {
  it('are newest first with unique versions and non-empty sections', () => {
    const versions = PATCH_NOTES.map((p) => p.version);
    expect(new Set(versions).size).toBe(versions.length);
    const num = (v: string) => v.split('.').reduce((a, x) => a * 1000 + Number(x), 0);
    for (let i = 1; i < versions.length; i++) expect(num(versions[i - 1])).toBeGreaterThan(num(versions[i]));
    for (const p of PATCH_NOTES) {
      expect(p.sections.length).toBeGreaterThan(0);
      for (const s of p.sections) expect(s.items.length).toBeGreaterThan(0);
    }
  });
});
