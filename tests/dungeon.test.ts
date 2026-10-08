import { describe, expect, it } from 'vitest';
import { DUNGEON } from '@/config/dungeon';
import { getCard } from '@/data/cards';
import { createNewSave } from '@/domain/newAccount';
import type { GameSave } from '@/domain/save';
import {
  dungeonDeck, dungeonOf, dungeonOffers, dungeonOpponent, dungeonPlayerMods, dungeonTreasureOffers, pickDungeonOffer,
  pickDungeonTreasure, recordDungeonMatch, repairDungeon, retireDungeon, startDungeon,
} from '@/domain/dungeon';
import { migrateSave } from '@/persistence/migrations';
import { validateDeck } from '@/domain/decks';

const NOW = Date.UTC(2026, 9, 8, 12);
const fresh = (): GameSave => ({ ...createNewSave('T', 'flame', NOW, 'p'), profile: { ...createNewSave('T', 'flame', NOW, 'p').profile, gold: 1000 } });
const must = (r: { ok: true; value: GameSave } | { ok: false; error: string }) => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

/** Starts a run and takes the opening card pick. */
const begin = (save: GameSave, faction: Parameters<typeof startDungeon>[1], seed: number) => must(pickDungeonOffer(must(startDungeon(save, faction, NOW, seed)), 0));

/** Wins the next match and takes the first reward on offer. */
function winAndPick(s: GameSave): GameSave {
  s = must(recordDungeonMatch(s, 'WIN', NOW));
  const run = dungeonOf(s).run;
  if (run?.pending === 'CARDS') s = must(pickDungeonOffer(s, 0));
  else if (run?.pending === 'TREASURE') s = must(pickDungeonTreasure(s, dungeonTreasureOffers(run)[0]));
  return s;
}

describe('Dungeon run', () => {
  it('starts free once a day with a small deck of commons from the Warden faction and Neutral', () => {
    let s = must(startDungeon(fresh(), 'VERDANT', NOW, 7));
    const run = dungeonOf(s).run!;
    expect(s.profile.gold).toBe(1000);
    expect(run.deck).toHaveLength(DUNGEON.startDeckSize);
    for (const id of run.deck) {
      const c = getCard(id)!;
      expect(c.rarity).toBe('COMMON');
      expect(['VERDANT', 'NEUTRAL']).toContain(c.faction);
    }
    // A second run the same day costs Gold.
    s = must(retireDungeon(s, NOW));
    s = must(startDungeon(s, 'EMBER', NOW, 8));
    expect(s.profile.gold).toBe(1000 - DUNGEON.entryGold);
  });

  it('every third opponent is a floor boss, and they get harder', () => {
    const s = must(startDungeon(fresh(), 'IRON', NOW, 3));
    const run = dungeonOf(s).run!;
    const opps = Array.from({ length: 9 }, (_, wins) => dungeonOpponent({ ...run, wins }));
    expect(opps.map((o) => !!o.boss)).toEqual([false, false, true, false, false, true, false, false, true]);
    expect(opps[0].difficulty).toBe('EASY');
    expect(opps[8].difficulty).toBe('EXPERT');
    // Same run, same opponents.
    expect(dungeonOpponent(run).id).toBe(dungeonOpponent(run).id);
  });

  it('a win offers cards; a boss win offers a treasure that changes the next matches', () => {
    let s = must(startDungeon(fresh(), 'TIDE', NOW, 11));
    // The run opens with a card pick; no match can be recorded before it.
    expect(dungeonOf(s).run!.pending).toBe('CARDS');
    expect(recordDungeonMatch(s, 'WIN', NOW).ok).toBe(false);
    s = must(pickDungeonOffer(s, 0));
    s = must(recordDungeonMatch(s, 'WIN', NOW));
    let run = dungeonOf(s).run!;
    expect(run.pending).toBe('CARDS');
    const offers = dungeonOffers(run);
    expect(offers.length).toBe(3);
    expect(offers.filter((o) => o.kind === 'BUNDLE').every((o) => o.cards.length === 3)).toBe(true);
    const before = run.deck.length;
    s = must(pickDungeonOffer(s, 0));
    expect(dungeonOf(s).run!.deck.length).toBe(before + offers[0].cards.length);
    // A match cannot start while a reward waits; picking twice is refused.
    expect(pickDungeonOffer(s, 0).ok).toBe(false);
    s = winAndPick(s);
    s = must(recordDungeonMatch(s, 'WIN', NOW));
    run = dungeonOf(s).run!;
    expect(run.pending).toBe('TREASURE');
    const options = dungeonTreasureOffers(run);
    expect(options).toHaveLength(3);
    s = must(pickDungeonTreasure(s, options[0]));
    expect(dungeonOf(s).run!.treasures).toEqual([options[0]]);
    const mods = dungeonPlayerMods(dungeonOf(s).run!);
    expect(Object.keys(mods).length).toBeGreaterThan(0);
  });

  it('the deck never breaks the copy limits', () => {
    let s = begin(fresh(), 'ASTRAL', 5);
    for (let i = 0; i < 8; i++) s = winAndPick(s);
    const deck = dungeonDeck(dungeonOf(s).run!);
    expect(validateDeck(deck).filter((x) => x.code !== 'SIZE')).toEqual([]);
  });

  it('a loss ends the run and pays by wins; a full clear pays the most and is remembered', () => {
    let s = begin(fresh(), 'VOID', 9);
    s = winAndPick(s);
    s = winAndPick(s);
    const gold = s.profile.gold;
    s = must(recordDungeonMatch(s, 'LOSS', NOW));
    expect(dungeonOf(s).run).toBeNull();
    expect(dungeonOf(s).last).toMatchObject({ wins: 2, cleared: false });
    expect(s.profile.gold).toBe(gold + DUNGEON.rewards[2].gold);

    let t = begin({ ...s, dungeon: { ...dungeonOf(s), freeEntryDay: null } }, 'VOID', 10);
    const packs = t.economy.packs[DUNGEON.packSet] ?? 0;
    for (let i = 0; i < 9; i++) t = winAndPick(t);
    const d = dungeonOf(t);
    expect(d.run).toBeNull();
    expect(d.last).toMatchObject({ wins: 9, cleared: true });
    expect(d.clears).toBe(1);
    expect(d.clearedFactions).toEqual(['VOID']);
    expect(t.economy.packs[DUNGEON.packSet]).toBe(packs + DUNGEON.rewards[9].packs);
  });

  it('giving up a free run before the first match pays nothing', () => {
    let s = must(startDungeon(fresh(), 'EMBER', NOW, 1));
    s = must(retireDungeon(s, NOW));
    expect(s.profile.gold).toBe(1000);
    expect(dungeonOf(s).last).toBeNull();
  });

  it('is kept across a reload and repaired when damaged', () => {
    const s = must(startDungeon(fresh(), 'EMBER', NOW, 1));
    expect(migrateSave(s).save.dungeon?.run?.deck).toEqual(dungeonOf(s).run!.deck);
    expect(repairDungeon({ run: { ...dungeonOf(s).run, deck: ['nope'] } }).run).toBeNull();
    expect(migrateSave({ ...s, dungeon: undefined }).save.dungeon).toEqual(repairDungeon(undefined));
  });
});
