import { describe, expect, it } from 'vitest';
import { tr } from '@/i18n';
import { KEYWORDS, keywordByName, KEYWORD_NAME_PATTERN, rebuildKeywordPattern } from '@/data/keywords';

describe('i18n', () => {
  it('English is the identity, with placeholders filled', () => {
    expect(tr('Shop', undefined, 'en')).toBe('Shop');
    expect(tr('You need {n} more Gold.', { n: 5 }, 'en')).toBe('You need 5 more Gold.');
    expect(tr('nav.shop', undefined, 'en')).toBe('Shop');
  });

  it('falls back to English for missing Czech text', () => {
    expect(tr('Some text nobody translated', undefined, 'cs')).toBe('Some text nobody translated');
  });

  it('keyword highlighting matches names with diacritics and aliases', () => {
    const before = { ...KEYWORDS.FREEZE };
    KEYWORDS.FREEZE.name = 'Zmrazení';
    KEYWORDS.FREEZE.aliases = ['Zmraz'];
    rebuildKeywordPattern();
    const found = 'Zmraz nepřátelskou jednotku.'.match(new RegExp(KEYWORD_NAME_PATTERN.source, 'gu'));
    expect(found).toEqual(['Zmraz']);
    expect(keywordByName('zmraz')?.id).toBe('FREEZE');
    Object.assign(KEYWORDS.FREEZE, before);
    delete KEYWORDS.FREEZE.aliases;
    rebuildKeywordPattern();
  });
});
