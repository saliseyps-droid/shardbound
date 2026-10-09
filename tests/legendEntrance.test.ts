import { describe, expect, it } from 'vitest';
import { legendEntrance, legendTheme } from '@/ui/match/legendEntrance';
import type { GameEvent } from '@/engine/types';

const played = (cardId: string, player: 0 | 1 = 0) => ({ type: 'CARD_PLAYED', player, cardId, cardUid: 1 }) as GameEvent;

describe('legendary entrance', () => {
  it('plays for a Legendary unit played from hand, for either player', () => {
    expect(legendEntrance([played('neu_meowchick')])).toEqual({ cardId: 'neu_meowchick', player: 0 });
    expect(legendEntrance([played('neu_meowchick', 1)])).toEqual({ cardId: 'neu_meowchick', player: 1 });
  });

  it('does not play for other cards', () => {
    expect(legendEntrance([played('neu_trail_hound')])).toBeNull();
    expect(legendEntrance([])).toBeNull();
  });

  it('gives Meowchick its own theme and other Legendaries the golden one', () => {
    expect(legendTheme('neu_meowchick')).toBe('meowchick');
    expect(legendTheme('vod_nhal')).toBe('gold');
  });
});
