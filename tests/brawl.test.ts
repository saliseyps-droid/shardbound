import { describe, expect, it } from 'vitest';
import { applyBrawlMods, BRAWL_EPOCH, brawlFights, brawlPackSet, brawlPlayerMods, brawlRotation, brawlRotationEnds, findBrawlFight } from '@/domain/brawl';
import { BRAWL_MODIFIERS } from '@/data/brawl';
import { getCard } from '@/data/cards';
import { opponentSide } from '@/domain/matchSetup';
import { applyMatchResult, type MatchSummary } from '@/domain/matchResults';
import { createNewSave } from '@/domain/newAccount';
import { createGame } from '@/engine';
import { filler } from './helpers';

const DAY = 86_400_000;

describe('Brawl rotation', () => {
  it('changes every 21 days from Monday 00:00 UTC', () => {
    expect(new Date(BRAWL_EPOCH).getUTCDay()).toBe(1);
    expect(brawlRotation(BRAWL_EPOCH)).toBe(0);
    expect(brawlRotation(BRAWL_EPOCH + 21 * DAY - 1)).toBe(0);
    expect(brawlRotation(BRAWL_EPOCH + 21 * DAY)).toBe(1);
    expect(brawlRotationEnds(0)).toBe(BRAWL_EPOCH + 21 * DAY);
  });

  it('offers two fights of two modifiers each, four different ones, never two of the same group', () => {
    for (let r = 0; r < 60; r++) {
      const fights = brawlFights(r);
      expect(fights).toHaveLength(2);
      const ids = fights.flatMap((f) => f.modifiers.map((m) => m.id));
      expect(new Set(ids).size).toBe(4);
      for (const f of fights) {
        const [a, b] = f.modifiers;
        for (const g of a.groups ?? []) expect(b.groups ?? []).not.toContain(g);
      }
    }
  });

  it('is the same for everyone and differs between rotations', () => {
    expect(brawlFights(3).map((f) => f.modifiers.map((m) => m.id))).toEqual(brawlFights(3).map((f) => f.modifiers.map((m) => m.id)));
    const sets = new Set(Array.from({ length: 10 }, (_, r) => brawlFights(r).map((f) => f.modifiers.map((m) => m.id).join('+')).join('|')));
    expect(sets.size).toBeGreaterThan(5);
    expect(findBrawlFight('3-1')?.modifiers).toEqual(brawlFights(3)[1].modifiers);
  });

  it('uses only existing rule cards and Expert opponents', () => {
    for (const m of BRAWL_MODIFIERS) for (const id of [...(m.both?.rules ?? []), ...(m.opponent?.startingBoard ?? [])]) expect(getCard(id), id).toBeDefined();
    for (let r = 0; r < 10; r++) for (const f of brawlFights(r)) expect(f.opponent.difficulty).toBe('EXPERT');
  });

  it('builds both sides of a match from the modifiers', () => {
    const champion = BRAWL_MODIFIERS.find((m) => m.id === 'champion')!;
    const treasury = BRAWL_MODIFIERS.find((m) => m.id === 'treasury')!;
    const fight = { modifiers: [champion, treasury] };
    const player = applyBrawlMods({ name: 'P', avatar: 'a', deck: filler() }, brawlPlayerMods(fight));
    expect(player).toMatchObject({ startingArmor: 10, bonusStartingEnergy: 1, rules: ['brawl_rule_treasury'] });
    expect(player.heroHealth).toBeUndefined();
    // A real rotation with the Champion: the opponent gets 50 Health and a Legendary on the board.
    const r = Array.from({ length: 200 }, (_, i) => i).find((i) => brawlFights(i).some((f) => f.modifiers.some((m) => m.id === 'champion')))!;
    const f = brawlFights(r).find((x) => x.modifiers.some((m) => m.id === 'champion'))!;
    const opp = opponentSide(f.opponent);
    expect(opp.heroHealth).toBe(40);
    expect(getCard(opp.startingBoard![0])?.rarity).toBe('LEGENDARY');
    const game = createGame({ seed: 1, players: [applyBrawlMods({ name: 'P', avatar: 'a', deck: filler() }, brawlPlayerMods(f)), opp] }).state;
    expect(game.players[1].hero.health).toBe(40);
    expect(game.players[0].hero.armor).toBe(10);
  });

  it('pays packs of the newest set', () => {
    expect(brawlPackSet()).toBe('DRAGON');
  });
});

describe('recording Brawl matches', () => {
  const NOW = BRAWL_EPOCH + 2 * DAY;
  const summary = (result: MatchSummary['result'], fightId: string): MatchSummary => ({
    mode: 'BRAWL',
    opponentId: 'x',
    opponentName: 'Bot',
    difficulty: 'EXPERT',
    deckId: 'd',
    deckName: 'Deck',
    deckFaction: 'EMBER',
    result,
    turns: 8,
    durationMs: 1000,
    stats: { damageDealt: 0, heroDamageDealt: 0, cardsPlayed: 0, unitsPlayed: 0, spellsPlayed: 0, unitsDestroyed: 0, healingDone: 0, cardsDrawn: 0 },
    conceded: false,
    brawlFightId: fightId,
  });

  it('the first win in each fight of a rotation pays one pack, later wins do not', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const packs0 = save.economy.packs.DRAGON ?? 0;
    const { save: s1, rewards } = applyMatchResult(save, summary('WIN', '0-0'), NOW);
    expect(s1.economy.packs.DRAGON).toBe(packs0 + 1);
    expect(rewards.lines.some((l) => l.label === 'Brawl: first win' && l.packs?.setId === 'DRAGON')).toBe(true);
    expect(s1.profile.brawl).toEqual({ rotation: 0, won: ['0-0'] });
    const { save: s2 } = applyMatchResult(s1, summary('WIN', '0-0'), NOW);
    expect(s2.economy.packs.DRAGON).toBe(packs0 + 1);
    const { save: s3 } = applyMatchResult(s2, summary('WIN', '0-1'), NOW);
    expect(s3.economy.packs.DRAGON).toBe(packs0 + 2);
    // The next rotation pays again.
    const { save: s4 } = applyMatchResult(s3, summary('WIN', '1-0'), NOW + 21 * DAY);
    expect(s4.economy.packs.DRAGON).toBe(packs0 + 3);
    expect(s4.profile.brawl).toEqual({ rotation: 1, won: ['1-0'] });
    // A win in an older rotation's fight (finished after the rotation changed) pays nothing.
    const { save: s5 } = applyMatchResult(s4, summary('WIN', '0-1'), NOW + 21 * DAY);
    expect(s5.economy.packs.DRAGON).toBe(packs0 + 3);
  });

  it('a loss pays no pack', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const { save: s1 } = applyMatchResult(save, summary('LOSS', '0-0'), NOW);
    expect(s1.economy.packs.DRAGON ?? 0).toBe(save.economy.packs.DRAGON ?? 0);
    expect(s1.profile.brawl?.won ?? []).toEqual([]);
  });
});
