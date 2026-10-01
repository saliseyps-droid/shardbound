import { describe, expect, it } from 'vitest';
import { applyAction, createGame, currentHealth, getLegalActions, unitAttack } from '@/engine';
import { GAME_RULES } from '@/config/gameRules';
import { collectibleCards } from '@/data/cards';
import { act, addKeyword, endTurn, filler, giveCard, hero, newGame, ready, setEnergy, tryAct, unitAt, unitRef } from './helpers';

describe('setup, turns and resources', () => {
  it('deals opening hands and gives the second player a bonus card', () => {
    const s = newGame();
    expect(s.phase).toBe('MAIN');
    // First player: 3 + 1 turn draw
    expect(s.players[0].hand.length).toBe(GAME_RULES.startingHandFirst + 1);
    expect(s.players[1].hand.length).toBe(GAME_RULES.startingHandSecond + 1);
    expect(s.players[1].hand.some((c) => c.cardId === GAME_RULES.secondPlayerBonusCardId)).toBe(true);
  });

  it('mulligan replaces selected cards and then starts the game', () => {
    let { state } = createGame({
      seed: 3,
      firstPlayer: 0,
      players: [
        { name: 'A', avatar: 'a', deck: [...filler('emb_kindling_imp', 15), ...filler('token_recruit', 15)] },
        { name: 'B', avatar: 'b', deck: filler() },
      ],
    });
    expect(state.phase).toBe('MULLIGAN');
    const replace = state.players[0].hand.slice(0, 2).map((c) => c.uid);
    state = act(state, { type: 'MULLIGAN', player: 0, replaceUids: replace });
    expect(state.players[0].hand.length).toBe(3);
    expect(state.players[0].hand.some((c) => replace.includes(c.uid))).toBe(false);
    expect(state.phase).toBe('MULLIGAN');
    state = act(state, { type: 'MULLIGAN', player: 1, replaceUids: [] });
    expect(state.phase).toBe('MAIN');
    expect(state.players[0].deck.length + state.players[0].hand.length).toBe(30);
  });

  it('gains and refills energy each turn up to the cap', () => {
    let s = newGame();
    expect(s.players[0].maxEnergy).toBe(1);
    for (let i = 0; i < 25; i++) s = endTurn(s);
    expect(s.players[0].maxEnergy).toBe(GAME_RULES.maxEnergy);
    expect(s.players[1].maxEnergy).toBe(GAME_RULES.maxEnergy);
    expect(s.players[s.activePlayer].energy).toBe(GAME_RULES.maxEnergy);
  });

  it('cannot spend unavailable energy', () => {
    const s = newGame();
    const uid = giveCard(s, 0, 'emb_magma_brute');
    const res = tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(res.error).toBe('Not enough energy');
    expect(res.state).toBe(s);
  });

  it('rejects actions from the inactive player', () => {
    const s = newGame();
    expect(tryAct(s, { type: 'END_TURN', player: 1 }).error).toBeDefined();
  });

  it('applies fatigue when drawing from an empty deck', () => {
    let s = newGame({ deck0: filler('token_recruit', 4), deck1: filler('token_recruit', 30) });
    expect(s.players[0].deck.length).toBe(0);
    s = endTurn(s);
    s = endTurn(s); // P0 draws from empty deck: 1 fatigue
    expect(s.players[0].hero.health).toBe(GAME_RULES.heroStartingHealth - 1);
    s = endTurn(s);
    s = endTurn(s); // 2 fatigue
    expect(s.players[0].hero.health).toBe(GAME_RULES.heroStartingHealth - 3);
  });

  it('burns cards drawn with a full hand', () => {
    let s = newGame();
    for (let i = 0; i < 10; i++) giveCard(s, 0, 'token_recruit');
    s.players[0].hand = s.players[0].hand.slice(0, 10);
    s = endTurn(s);
    s = endTurn(s);
    expect(s.players[0].hand.length).toBe(10);
    expect(s.log.some((e) => e.type === 'CARD_BURNED')).toBe(true);
  });

  it('is deterministic for the same seed and actions', () => {
    const run = () => {
      let s = newGame({ seed: 99, deck0: filler('emb_blazing_barrage'), board1: ['token_recruit', 'token_recruit'] });
      setEnergy(s, 0, 10);
      const uid = s.players[0].hand[0].uid;
      s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
      return JSON.stringify(s.players);
    };
    expect(run()).toBe(run());
  });
});

describe('playing cards', () => {
  it('plays a unit onto the battlefield and pays its cost', () => {
    let s = newGame();
    const uid = giveCard(s, 0, 'emb_kindling_imp');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[0].board.map((u) => u.cardId)).toContain('emb_kindling_imp');
    expect(s.players[0].energy).toBe(0);
    expect(s.players[0].stats.unitsPlayed).toBe(1);
  });

  it('resolves targeted spells and requires a valid target', () => {
    let s = newGame({ board1: ['token_recruit'] });
    const uid = giveCard(s, 0, 'emb_flame_jolt');
    expect(tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: uid }).error).toBe('A target is required');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: hero(1) });
    expect(s.players[1].hero.health).toBe(27);
  });

  it('On Deploy effects resolve when the unit is played', () => {
    let s = newGame();
    setEnergy(s, 0, 4);
    const uid = giveCard(s, 0, 'emb_magma_brute');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[1].hero.health).toBe(28);
  });

  it('respects the maximum board size', () => {
    const s = newGame({ board0: filler('token_recruit', 7) });
    const uid = giveCard(s, 0, 'token_recruit');
    expect(tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: uid }).error).toBe('Battlefield is full');
  });

  it('Overcharge only resolves when enough energy is left over', () => {
    let s = newGame({ board1: ['token_golem'] });
    setEnergy(s, 0, 2);
    const a = giveCard(s, 0, 'emb_searing_brand');
    const target = unitRef(unitAt(s, 1, 0));
    const s1 = act(s, { type: 'PLAY_CARD', player: 0, cardUid: a, target });
    expect(s1.players[1].hero.health).toBe(30);
    setEnergy(s, 0, 4);
    const s2 = act(s, { type: 'PLAY_CARD', player: 0, cardUid: a, target });
    expect(s2.players[1].hero.health).toBe(28);
    expect(s2.players[0].energy).toBe(0);
  });

  it('Empower increases spell damage', () => {
    let s = newGame({ board0: ['emb_scorch_adept'] });
    const uid = giveCard(s, 0, 'emb_flame_jolt');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: hero(1) });
    expect(s.players[1].hero.health).toBe(26);
  });

  it('Echo adds a Fleeting copy (without Echo) that expires at end of turn', () => {
    const echoCard = collectibleCards().find((c) => c.keywords?.includes('ECHO') && !c.target && c.cardType !== 'LOCATION');
    if (!echoCard) return; // content-dependent
    let s = newGame({ board0: [], board1: [] });
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, echoCard.id);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    const copy = s.players[0].hand.find((c) => c.echoCopy);
    expect(copy?.cardId).toBe(echoCard.id);
    expect(copy?.fleeting).toBe(true);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: copy!.uid });
    expect(s.players[0].hand.some((c) => c.echoCopy)).toBe(false);
  });

  it('Fleeting cards are discarded at end of turn', () => {
    let s = newGame();
    const fleetUid = s.nextUid++;
    s.players[0].hand.push({ uid: fleetUid, cardId: 'token_recruit', costMod: 0, fleeting: true });
    s = endTurn(s);
    expect(s.players[0].hand.some((c) => c.uid === fleetUid)).toBe(false);
  });

  it('Aether Shard grants temporary energy', () => {
    let s = newGame();
    s = endTurn(s);
    const shard = s.players[1].hand.find((c) => c.cardId === GAME_RULES.secondPlayerBonusCardId)!;
    const before = s.players[1].energy;
    s = act(s, { type: 'PLAY_CARD', player: 1, cardUid: shard.uid });
    expect(s.players[1].energy).toBe(before + 1);
  });
});

describe('combat', () => {
  it('deals simultaneous damage and removes dead units', () => {
    let s = newGame({ board0: ['token_golem'], board1: ['token_drakeling'] });
    const atk = unitAt(s, 0, 0);
    const def = unitAt(s, 1, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: atk.uid, target: unitRef(def) });
    expect(s.players[1].board.length).toBe(0);
    expect(currentHealth(s.players[0].board[0])).toBe(4);
    expect(s.players[1].graveyard).toContain('token_drakeling');
    expect(s.players[0].stats.unitsDestroyed).toBe(1);
  });

  it('units cannot attack the turn they are deployed unless Swift/Rush', () => {
    let s = newGame();
    setEnergy(s, 0, 5);
    const a = giveCard(s, 0, 'token_recruit');
    const b = giveCard(s, 0, 'token_drakeling');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: a });
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: b });
    const [recruit, drake] = s.players[0].board;
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: recruit.uid, target: hero(1) }).error).toBeDefined();
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: drake.uid, target: hero(1) });
    expect(s.players[1].hero.health).toBe(28);
  });

  it('Rush units can only attack units on their first turn', () => {
    let s = newGame({ board1: ['token_recruit'] });
    setEnergy(s, 0, 5);
    const w = giveCard(s, 0, 'token_wolf');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: w });
    const wolf = unitAt(s, 0, 0);
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: wolf.uid, target: hero(1) }).error).toBeDefined();
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: wolf.uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[1].board.length).toBe(0);
  });

  it('Guard forces attacks onto guarding units', () => {
    const s = newGame({ board0: ['token_golem'], board1: ['token_recruit', 'token_sentry'] });
    const atk = unitAt(s, 0, 0);
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: atk.uid, target: hero(1) }).error).toBe('Invalid attack target');
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: atk.uid, target: unitRef(unitAt(s, 1, 0)) }).error).toBe('Invalid attack target');
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: atk.uid, target: unitRef(unitAt(s, 1, 1)) }).error).toBeUndefined();
  });

  it('Barrier prevents the first damage instance', () => {
    let s = newGame({ board0: ['token_golem'], board1: ['token_recruit'] });
    addKeyword(unitAt(s, 1, 0), 'BARRIER');
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[1].board.length).toBe(1);
    expect(s.players[1].board[0].barrier).toBe(false);
  });

  it('Venom destroys any unit it damages', () => {
    let s = newGame({ board0: ['token_recruit'], board1: ['token_golem'] });
    addKeyword(unitAt(s, 0, 0), 'VENOM');
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[1].board.length).toBe(0);
    expect(s.players[0].board.length).toBe(0);
  });

  it('Drain heals the controller by damage dealt', () => {
    let s = newGame({ board0: ['token_golem'] });
    s.players[0].hero.health = 20;
    addKeyword(unitAt(s, 0, 0), 'DRAIN');
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: hero(1) });
    expect(s.players[0].hero.health).toBe(26);
    expect(s.players[1].hero.health).toBe(24);
  });

  it('Frenzy allows two attacks per turn', () => {
    let s = newGame({ board0: ['token_recruit'] });
    addKeyword(unitAt(s, 0, 0), 'FRENZY');
    const uid = unitAt(s, 0, 0).uid;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: uid, target: hero(1) });
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: uid, target: hero(1) });
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: uid, target: hero(1) }).error).toBeDefined();
    expect(s.players[1].hero.health).toBe(28);
  });

  it('Ambush units cannot be attacked or targeted until they attack', () => {
    let s = newGame({ board0: ['token_drakeling', 'token_recruit'], board1: ['token_recruit'] });
    addKeyword(unitAt(s, 1, 0), 'AMBUSH');
    const target = unitRef(unitAt(s, 1, 0));
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target }).error).toBeDefined();
    const jolt = giveCard(s, 0, 'emb_flame_jolt');
    expect(tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: jolt, target }).error).toBe('Invalid target');
    s = endTurn(s);
    s = act(s, { type: 'ATTACK', player: 1, attackerUid: unitAt(s, 1, 0).uid, target: hero(0) });
    expect(s.players[1].board[0].ambush).toBe(false);
  });

  it('Ward protects against enemy spells but not attacks', () => {
    const s = newGame({ board0: ['token_golem'], board1: ['token_recruit'] });
    addKeyword(unitAt(s, 1, 0), 'WARD');
    const jolt = giveCard(s, 0, 'emb_flame_jolt');
    const target = unitRef(unitAt(s, 1, 0));
    expect(tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: jolt, target }).error).toBe('Invalid target');
    expect(tryAct(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target }).error).toBeUndefined();
  });

  it('Freeze prevents attacking during the next turn, then thaws', () => {
    let s = newGame({ board0: ['token_recruit'], board1: ['token_golem'] });
    unitAt(s, 1, 0).frozen = true;
    s = endTurn(s); // P1 turn: frozen golem can't attack
    const golem = unitAt(s, 1, 0);
    expect(tryAct(s, { type: 'ATTACK', player: 1, attackerUid: golem.uid, target: unitRef(unitAt(s, 0, 0)) }).error).toBe('Frozen');
    s = endTurn(s);
    expect(s.players[1].board[0].frozen).toBe(false);
  });

  it('Burn damages at the start of the controller turn and fades', () => {
    let s = newGame({ board1: ['token_golem'] });
    unitAt(s, 1, 0).burn = 3;
    s = endTurn(s);
    expect(currentHealth(unitAt(s, 1, 0))).toBe(3);
    expect(unitAt(s, 1, 0).burn).toBe(2);
  });

  it('Regenerate heals the unit fully at end of its controller turn', () => {
    let s = newGame({ board0: ['token_golem'] });
    addKeyword(unitAt(s, 0, 0), 'REGENERATE');
    unitAt(s, 0, 0).damage = 4;
    s = endTurn(s);
    expect(currentHealth(unitAt(s, 0, 0))).toBe(6);
  });

  it('auras modify attack while the source is alive', () => {
    const s = newGame({ board0: ['emb_legion_banneret', 'token_recruit'] });
    expect(unitAttack(s, unitAt(s, 0, 1))).toBe(2);
    expect(unitAttack(s, unitAt(s, 0, 0))).toBe(2);
  });
});

describe('triggers and death resolution', () => {
  it('Last Breath resolves when a unit dies', () => {
    let s = newGame({ board0: ['token_golem'], board1: ['emb_ashborn_phoenix'] });
    const deckBefore = s.players[1].deck.length;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[1].board.length).toBe(0);
    expect(s.players[1].deck.length).toBe(deckBefore + 1);
    expect(s.players[1].deck.some((c) => c.cardId === 'emb_ashborn_phoenix')).toBe(true);
  });

  it('spell-cast triggers fire after a spell resolves', () => {
    let s = newGame({ board0: ['emb_ignivar'] });
    const jolt = giveCard(s, 0, 'emb_flame_jolt');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: jolt, target: hero(1) });
    // 3 + Empower 2 = 5 from the spell, +2 from Ignivar trigger
    expect(s.players[1].hero.health).toBe(23);
  });

  it('turn start triggers resolve for locations and expire them', () => {
    let s = newGame({ board1: ['token_recruit'] });
    setEnergy(s, 0, 3);
    const loc = giveCard(s, 0, 'emb_kharzul_caldera');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: loc });
    s = endTurn(s);
    s = endTurn(s);
    expect(s.players[1].board.length).toBe(0);
    expect(s.players[1].hero.health).toBe(29);
    s = endTurn(s);
    s = endTurn(s);
    s = endTurn(s);
    s = endTurn(s);
    expect(s.players[0].location).toBeNull();
  });

  it('relics lose charges and break', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    const kiln = giveCard(s, 0, 'emb_everburning_kiln');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: kiln });
    for (let i = 0; i < 4; i++) {
      const j = giveCard(s, 0, 'emb_flame_jolt');
      s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: j, target: hero(1) });
    }
    expect(s.players[0].relics.length).toBe(0);
    expect(s.players[1].hero.health).toBe(30 - 4 * 4);
  });

  it('never leaves units with non-positive health on the board', () => {
    let s = newGame({ deck0: filler('emb_ember_volley'), board1: filler('token_recruit', 5) });
    setEnergy(s, 0, 2);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: s.players[0].hand[0].uid });
    for (const p of s.players) for (const u of p.board) expect(currentHealth(u)).toBeGreaterThan(0);
  });

  it('random multi-hit effects never target dead units', () => {
    let s = newGame({ board1: ['token_recruit'] });
    setEnergy(s, 0, 3);
    const b = giveCard(s, 0, 'emb_blazing_barrage');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: b });
    const toUnit = s.log.filter((e) => e.type === 'DAMAGE_DEALT' && e.target.type === 'unit');
    expect(toUnit.length).toBeLessThanOrEqual(1);
    expect(s.players[1].hero.health).toBe(30 - (5 - toUnit.length));
  });
});

describe('win conditions', () => {
  it('reducing a hero to 0 ends the game', () => {
    let s = newGame({ board0: ['token_golem'] });
    s.players[1].hero.health = 5;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: hero(1) });
    expect(s.phase).toBe('ENDED');
    expect(s.winner).toBe(0);
    expect(applyAction(s, { type: 'END_TURN', player: 0 }).error).toBe('Game is over');
  });

  it('armor absorbs damage before health', () => {
    let s = newGame({ board0: ['token_golem'] });
    s.players[1].hero.armor = 4;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: hero(1) });
    expect(s.players[1].hero.armor).toBe(0);
    expect(s.players[1].hero.health).toBe(28);
  });

  it('concede awards the win to the opponent', () => {
    const s = act(newGame(), { type: 'CONCEDE', player: 0 });
    expect(s.winner).toBe(1);
    expect(s.endReason).toBe('CONCEDE');
  });

  it('defeating the enemy Warden with a spell wins', () => {
    let s = newGame({ deck0: filler('emb_ember_volley') });
    s.players[1].hero.health = 1;
    setEnergy(s, 0, 2);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: s.players[0].hand[0].uid });
    expect(s.winner).toBe(0);
  });

  it('simultaneous Warden deaths end in a draw', () => {
    let s = newGame({ board0: ['token_golem'], board1: ['token_golem'] });
    // Drain would be irrelevant; use a Last Breath-free trade where both heroes are at 0 via direct setup.
    s.players[0].hero.health = 0;
    s.players[1].hero.health = 0;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.winner).toBe('DRAW');
  });

  it('only legal actions are generated', () => {
    let s = newGame({ deck0: filler('emb_flame_jolt'), board0: ['token_recruit'], board1: ['token_sentry'] });
    ready(s, 0);
    const actions = getLegalActions(s, 0);
    for (const a of actions) expect(tryAct(s, a).error, JSON.stringify(a)).toBeUndefined();
  });
});
