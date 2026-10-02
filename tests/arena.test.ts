import { describe, expect, it } from 'vitest';
import { ARENA } from '@/config/arena';
import { getCard } from '@/data/cards';
import { CARD_BACKS } from '@/data/cardBacks';
import { defaultBuild } from '@/data/wardenTalents';
import { createNewSave } from '@/domain/newAccount';
import { maxCopiesFor, validateDeck } from '@/domain/decks';
import { CURRENT_SAVE_VERSION, type GameSave } from '@/domain/save';
import { migrateSave } from '@/persistence/migrations';
import {
  arenaDeck,
  arenaOpponent,
  arenaPhase,
  arenaRewards,
  chooseArenaFaction,
  currentOffer,
  pickArenaCard,
  recordArenaMatch,
  retireArena,
  setArenaTalents,
  startArena,
} from '@/domain/arena';

const rich = (gold = 1000): GameSave => {
  const s = createNewSave('A', 'flame', 1, 'p');
  return { ...s, profile: { ...s.profile, gold } };
};
const ok = <T,>(r: { ok: true; value: T } | { ok: false; error: string }): T => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

/** Starts a run and drafts the whole deck by always taking the first offered card. */
function drafted(seed = 7): GameSave {
  let s = ok(startArena(rich(), 1, seed));
  s = ok(chooseArenaFaction(s, s.arena.run!.factionChoices[0]));
  while (arenaPhase(s.arena.run!) === 'DRAFT') s = ok(pickArenaCard(s, currentOffer(s.arena.run!)[0]));
  return s;
}

describe('arena', () => {
  it('costs the entry fee and offers two different factions', () => {
    expect(startArena(rich(299), 1, 1).ok).toBe(false);
    const s = ok(startArena(rich(1000), 1, 1));
    expect(s.profile.gold).toBe(1000 - ARENA.entryGold);
    const [a, b] = s.arena.run!.factionChoices;
    expect(a).not.toBe(b);
    expect(arenaPhase(s.arena.run!)).toBe('FACTION');
    expect(startArena(s, 2, 2).ok).toBe(false); // one run at a time
  });

  it('only lets you pick one of the two offered factions', () => {
    const s = ok(startArena(rich(), 1, 3));
    const other = (['EMBER', 'VERDANT', 'IRON', 'ASTRAL', 'VOID', 'TIDE'] as const).find((f) => !s.arena.run!.factionChoices.includes(f))!;
    expect(chooseArenaFaction(s, other).ok).toBe(false);
  });

  it('offers 3 different cards of one rarity from the faction or Neutral, deterministically', () => {
    let s = ok(startArena(rich(), 1, 11));
    const f = s.arena.run!.factionChoices[1];
    s = ok(chooseArenaFaction(s, f));
    const offer = currentOffer(s.arena.run!);
    expect(offer).toHaveLength(3);
    expect(new Set(offer).size).toBe(3);
    expect(currentOffer(s.arena.run!)).toEqual(offer);
    for (const id of offer) {
      const c = getCard(id)!;
      expect(c.collectible).toBe(true);
      expect([f, 'NEUTRAL']).toContain(c.faction);
    }
    expect(new Set(offer.map((id) => getCard(id)!.rarity)).size).toBe(1);
  });

  it('refuses cards that are not in the current offer', () => {
    let s = ok(startArena(rich(), 1, 5));
    s = ok(chooseArenaFaction(s, s.arena.run!.factionChoices[0]));
    expect(pickArenaCard(s, 'not_offered').ok).toBe(false);
  });

  it('drafts a valid 30-card deck that never breaks copy limits', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const s = drafted(seed);
      const run = s.arena.run!;
      expect(run.picks).toHaveLength(ARENA.deckSize);
      const counts: Record<string, number> = {};
      for (const id of run.picks) counts[id] = (counts[id] ?? 0) + 1;
      for (const [id, n] of Object.entries(counts)) expect(n).toBeLessThanOrEqual(maxCopiesFor(getCard(id)!));
      expect(arenaPhase(run)).toBe('TALENTS');
      const issues = validateDeck({ ...arenaDeck(run), talents: defaultBuild(run.faction!) });
      expect(issues.filter((i) => i.code !== 'TALENTS')).toEqual([]);
    }
  });

  it('needs a valid talent build before playing, then gets harder opponents', () => {
    let s = drafted();
    const f = s.arena.run!.faction!;
    expect(setArenaTalents(s, []).ok).toBe(false);
    s = ok(setArenaTalents(s, defaultBuild(f)));
    expect(arenaPhase(s.arena.run!)).toBe('PLAYING');
    expect(arenaOpponent(s.arena.run!).difficulty).toBe('NORMAL');
    s = ok(recordArenaMatch(s, 'WIN', 2));
    s = ok(recordArenaMatch(s, 'WIN', 3));
    expect(arenaOpponent(s.arena.run!).difficulty).toBe('HARD');
    s = ok(recordArenaMatch(s, 'WIN', 4));
    expect(arenaOpponent(s.arena.run!).difficulty).toBe('EXPERT');
  });

  it('ends at the first loss and pays the reward for the wins', () => {
    let s = ok(setArenaTalents(drafted(), defaultBuild(drafted().arena.run!.faction!)));
    s = ok(recordArenaMatch(s, 'WIN', 2));
    const gold = s.profile.gold;
    const packs = (s.economy.packs.CORE ?? 0) + (s.economy.packs.DEEP ?? 0);
    s = ok(recordArenaMatch(s, 'LOSS', 3));
    expect(s.arena.run).toBeNull();
    expect(s.arena.last?.wins).toBe(1);
    expect(s.profile.gold).toBe(gold + ARENA.rewards[1].gold);
    expect((s.economy.packs.CORE ?? 0) + (s.economy.packs.DEEP ?? 0)).toBe(packs + ARENA.rewards[1].packs);
  });

  it('a perfect run ends after 4 wins and grants an unowned card back', () => {
    let s = ok(setArenaTalents(drafted(), defaultBuild(drafted().arena.run!.faction!)));
    for (let i = 0; i < 4; i++) s = ok(recordArenaMatch(s, 'WIN', 2 + i));
    expect(s.arena.run).toBeNull();
    expect(s.arena.last?.wins).toBe(4);
    const back = s.arena.last?.reward.cardBack;
    expect(back).toBeTruthy();
    expect(s.profile.cardBacks).toContain(back);
  });

  it('pays Gold instead of a card back when every back is owned', () => {
    const r = arenaRewards(4, CARD_BACKS.map((b) => b.id), () => 0.5);
    expect(r.cardBack).toBeUndefined();
    expect(r.gold).toBe(ARENA.rewards[4].gold + ARENA.cardBackFallbackGold);
    expect(r.packs.reduce((a, p) => a + p.amount, 0)).toBe(ARENA.rewards[4].packs);
  });

  it('retiring ends the run with the current wins', () => {
    let s = ok(startArena(rich(), 1, 9));
    s = ok(retireArena(s, 2));
    expect(s.arena.run).toBeNull();
    expect(s.arena.last?.wins).toBe(0);
  });

  it('repairs saves without arena data or with a broken run', () => {
    const base = { saveVersion: CURRENT_SAVE_VERSION, profile: { username: 'Old' }, decks: [] };
    expect(migrateSave(base).save.arena).toEqual({ run: null, last: null, runsPlayed: 0, bestWins: 0 });
    const broken = migrateSave({ ...base, arena: { run: { id: 'x', picks: 'nope' }, last: null, runsPlayed: 2, bestWins: 3 } }).save.arena;
    expect(broken.run).toBeNull();
    expect(broken.runsPlayed).toBe(2);
    const s = drafted();
    const kept = migrateSave({ ...base, arena: s.arena }).save.arena;
    expect(kept.run?.picks).toEqual(s.arena.run!.picks);
  });
});
