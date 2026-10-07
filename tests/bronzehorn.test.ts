import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { act, giveCard, newGame, setEnergy } from './helpers';

describe('R3-D3', () => {
  it('is an 8-cost Brass Dominion Legendary 1/1 in Dragon Realm', () => {
    expect(getCard('irn_bronzehorn_colossus')).toMatchObject({ faction: 'IRON', rarity: 'LEGENDARY', set: 'DRAGON', manaCost: 8, attack: 1, health: 1 });
  });

  it('gains +1/+1 per Armor on deploy', () => {
    let s = newGame();
    s.players[0].hero.armor = 7;
    setEnergy(s, 0, 8);
    const uid = giveCard(s, 0, 'irn_bronzehorn_colossus');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    const u = s.players[0].board.find((x) => x.cardId === 'irn_bronzehorn_colossus')!;
    expect([u.baseAttack + u.attackBuff, u.baseHealth + u.healthBuff]).toEqual([8, 8]);
    expect(s.players[0].hero.armor).toBe(0);
  });
});
