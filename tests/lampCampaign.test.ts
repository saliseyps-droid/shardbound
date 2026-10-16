import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAMPAIGNS, LAMP_CAMPAIGN, campaignOf, findEncounter } from '@/data/opponents';
import { cardsBy, getCard, hasCard, poolCards } from '@/data/cards';
import { getTalent } from '@/data/wardenTalents';
import { opponentSide } from '@/domain/matchSetup';
import { createNewSave } from '@/domain/newAccount';
import { craftCard, craftCost, recycleCard } from '@/domain/economy';
import { addCards } from '@/domain/save';
import { applyMatchResult } from '@/domain/matchResults';
import { buyChapter } from '@/domain/campaignUnlock';
import { isUnlocked } from '@/ui/components/meta/campaign';
import { migrateSave } from '@/persistence/migrations';
import cs from '@/i18n/cs/data/opponents';
import csCards from '@/i18n/cs/cards/lamplight';
import { act, giveCard, newGame, setEnergy, unitAt } from './helpers';

const flat = LAMP_CAMPAIGN.flatMap((c) => c.encounters);
const REWARDS = ['neu_nyx_lantern_of_nul', 'neu_vael_the_void_knell', 'neu_oblivia_keeper_of_the_last_page'];

describe("The Lamplighters' Road", () => {
  it('is a third campaign of three chapters, three fights each, every boss paying its own legend', () => {
    expect(CAMPAIGNS.map((c) => c.id)).toEqual(['main', 'void', 'lamp', 'inn', 'inferno']);
    expect(LAMP_CAMPAIGN).toHaveLength(3);
    LAMP_CAMPAIGN.forEach((ch, i) => {
      expect(ch.encounters).toHaveLength(3);
      const boss = ch.encounters.at(-1)!;
      expect(boss.boss, boss.id).toBe(true);
      expect(boss.firstWinReward?.cardId).toBe(REWARDS[i]);
      expect(boss.special?.extraCards, boss.id).toContain(REWARDS[i]);
    });
    expect(campaignOf('l2_e1').id).toBe('lamp');
    expect(findEncounter('l3_boss')?.chapter.id).toBe('lr3');
  });

  it('uses real cards and talents, its own portraits, and is translated', () => {
    for (const ch of LAMP_CAMPAIGN) {
      expect(cs.chapters?.[ch.id]?.name, ch.id).toBeTruthy();
      for (const e of ch.encounters) {
        for (const id of e.special?.extraCards ?? []) expect(hasCard(id), `${e.id} ${id}`).toBe(true);
        expect(cs.opponents?.[e.id]?.special?.length ?? 0, e.id).toBe(e.special?.description.length ?? 0);
        expect(existsSync(`src/assets/portraits/${e.portrait}.webp`), e.id).toBe(true);
        expect(opponentSide(e).portrait ?? null, e.id).toBe(e.portrait);
        for (const t of e.special?.talents ?? []) expect(getTalent(t.abilityId)?.levels[t.level], `${e.id} ${t.abilityId}`).toBeTruthy();
      }
    }
    expect(new Set(flat.map((e) => e.portrait)).size).toBe(flat.length);
  });

  it('beating a boss for the first time adds its legend to the collection', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const boss = flat.find((e) => e.id === 'l1_boss')!;
    const { save: next } = applyMatchResult(save, { ...emptySummary(), mode: 'PVE', pveEncounterId: boss.id, firstWinReward: boss.firstWinReward }, Date.now());
    expect(next.collection.cards.neu_nyx_lantern_of_nul?.NORMAL).toBe(1);
  });
});

describe("The Lamplighters' Road: chapters bought with Gold", () => {
  it('every chapter costs 500 Gold and stays locked until bought', () => {
    for (const ch of LAMP_CAMPAIGN) expect(ch.price).toBe(500);
    const save = createNewSave('A', 'flame', 1, 'p');
    save.profile.gold = 2000;
    expect(isUnlocked(save, 'l1_e1')).toBe(false);
    const bought = buyChapter(save, 'lr1', 0);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.value.profile.gold).toBe(1500);
    expect(isUnlocked(bought.value, 'l1_e1')).toBe(true);
    expect(isUnlocked(bought.value, 'l1_e2')).toBe(false);
    expect(buyChapter(bought.value, 'lr1', 0).ok).toBe(false);
  });

  it('the next chapter is sold only after the previous one is cleared, and never without Gold', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    save.profile.gold = 2000;
    expect(buyChapter(save, 'lr2', 0).ok).toBe(false);
    for (const e of LAMP_CAMPAIGN[0].encounters) save.pve.completed[e.id] = { firstClearAt: 1, wins: 1 };
    const res = buyChapter(save, 'lr2', 0);
    expect(res.ok).toBe(true);
    if (res.ok) expect(isUnlocked(res.value, 'l2_e1')).toBe(true);
    expect(buyChapter({ ...save, profile: { ...save.profile, gold: 499 } }, 'lr2', 0).ok).toBe(false);
    // Free campaigns are unaffected.
    expect(isUnlocked(save, 'c1_e1')).toBe(true);
    expect(buyChapter(save, 'vr1', 0).ok).toBe(false);
  });

  it('bought chapters survive a win and a reload', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    save.profile.gold = 2000;
    const res = buyChapter(save, 'lr1', 0);
    if (!res.ok) throw new Error(res.error);
    const boss = flat[0];
    const { save: won } = applyMatchResult(res.value, { ...emptySummary(), mode: 'PVE', pveEncounterId: boss.id, firstWinReward: boss.firstWinReward }, 1);
    expect(won.pve.unlockedChapters).toEqual(['lr1']);
    const reloaded = migrateSave(JSON.parse(JSON.stringify(won))).save;
    expect(reloaded.pve.unlockedChapters).toEqual(['lr1']);
  });
});

describe('Lamplighter legends', () => {
  it('are Neutral legendaries with art and Czech text, kept out of every random pool', () => {
    for (const id of REWARDS) {
      const c = getCard(id)!;
      expect(c.faction).toBe('NEUTRAL');
      expect(c.rarity).toBe('LEGENDARY');
      expect(c.collectible && c.rewardOnly).toBe(true);
      expect(existsSync(`src/assets/cards/${id}.webp`), id).toBe(true);
      expect(csCards[id]?.name, id).toBeTruthy();
      expect(poolCards().some((p) => p.id === id)).toBe(false);
      expect(cardsBy({ rarity: 'LEGENDARY' }).some((p) => p.id === id)).toBe(false);
      expect(craftCost(id)).toBe(Infinity);
    }
  });

  it('cannot be crafted or recycled', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    save.profile.essence = 99999;
    expect(craftCard(save, 'neu_nyx_lantern_of_nul', 'NORMAL', 0).ok).toBe(false);
    const owned = { ...save, collection: addCards(save.collection, [{ cardId: 'neu_nyx_lantern_of_nul', variant: 'NORMAL' }]) };
    expect(recycleCard(owned, 'neu_nyx_lantern_of_nul', 'NORMAL').ok).toBe(false);
  });

  it('Nyx heals your Warden whenever you cast a spell', () => {
    let s = newGame({ board0: ['neu_nyx_lantern_of_nul'] });
    s.players[0].hero.health = 20;
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'ast_chart_the_heavens') });
    expect(s.players[0].hero.health).toBe(22);
  });

  it('Vael deals 2 damage to every other unit, friend or foe', () => {
    let s = newGame({ board0: ['neu_stonehide_ox'], board1: ['neu_stonehide_ox', 'token_recruit'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_vael_the_void_knell') });
    expect(s.players[1].board).toHaveLength(1);
    expect(s.players[1].board[0].damage).toBe(2);
    expect(unitAt(s, 0, 0).damage).toBe(2);
    expect(s.players[0].board.find((u) => u.cardId === 'neu_vael_the_void_knell')!.damage).toBe(0);
  });

  it('Oblivia returns copies of the last two different spells you cast', () => {
    let s = newGame();
    setEnergy(s, 0, 20);
    for (const id of ['ast_chart_the_heavens', 'irn_fortress_plating', 'ast_ringing_refrain', 'irn_fortress_plating']) {
      s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, id) });
    }
    s.players[0].hand = [];
    setEnergy(s, 0, 20);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_oblivia_keeper_of_the_last_page') });
    expect(s.players[0].hand.map((c) => c.cardId)).toEqual(['ast_ringing_refrain', 'irn_fortress_plating']);
  });

  it('Oblivia with no spells cast just arrives', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    const before = s.players[0].hand.length;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_oblivia_keeper_of_the_last_page') });
    expect(s.players[0].hand.length).toBe(before);
  });
});

function emptySummary(): Parameters<typeof applyMatchResult>[1] {
  return {
    mode: 'PRACTICE', opponentId: 'x', opponentName: 'Bot', difficulty: 'NORMAL', deckId: 'starter_ember', deckName: 'Cinder Blitz',
    deckFaction: 'EMBER', result: 'WIN', turns: 12, durationMs: 60000, conceded: false,
    stats: { damageDealt: 30, heroDamageDealt: 30, cardsPlayed: 12, unitsPlayed: 8, spellsPlayed: 4, unitsDestroyed: 5, healingDone: 0, cardsDrawn: 10 },
  };
}
