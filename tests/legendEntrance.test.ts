import { describe, expect, it } from 'vitest';
import { bigSpell, legendEntrance, legendTheme } from '@/ui/match/legendEntrance';
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

  it('gives the six signature Legendaries their own themes', () => {
    expect(['ast_liu_kano', 'neu_captain_abandoneer', 'neu_rendoslav', 'emb_qvido', 'ast_bubblemaker_qinny', 'vod_tallys_the_menace'].map(legendTheme)).toEqual([
      'liu',
      'abandoneer',
      'rendoslav',
      'qvido',
      'qinny',
      'tallys',
    ]);
    expect(['ver_elinda', 'tid_skolky', 'irn_bronzehorn_colossus'].map(legendTheme)).toEqual(['elinda', 'skolky', 'r3d3']);
  });

  it('flags Epic and Legendary spells for a flourish, but not units or common spells', () => {
    expect(bigSpell([played('ast_collapse_of_heaven', 1)])).toEqual({ cardId: 'ast_collapse_of_heaven', player: 1, rarity: 'EPIC' });
    expect(bigSpell([played('neu_meowchick')])).toBeNull();
    expect(bigSpell([played('emb_flame_jolt')])).toBeNull();
  });
});
