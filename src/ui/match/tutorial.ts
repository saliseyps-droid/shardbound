import { getCard } from '@/data/cards';
import type { GameAction, GameEvent, GameState, MatchSetup } from '@/engine/types';
import { canPlayCard } from '@/engine/queries';
import { TUTORIAL_OPPONENT } from './tutorialData';

export { TUTORIAL_OPPONENT };

/** Fixed decks so every tutorial plays out the same way. */
export function tutorialSetup(playerName: string, avatar: string): MatchSetup {
  const playerDeck = ['tut_squire', 'tut_bolt', 'tut_knight', 'tut_knight', 'tut_squire', 'tut_bolt', 'tut_knight', 'tut_bolt', 'tut_knight', 'tut_squire', 'tut_bolt', 'tut_knight', 'tut_knight', 'tut_bolt', 'tut_knight'];
  const oppDeck = ['tut_goblin', 'tut_goblin', 'tut_goblin', 'tut_goblin', 'tut_dummy', 'tut_goblin', 'tut_dummy', 'tut_goblin', 'tut_goblin', 'tut_goblin', 'tut_goblin', 'tut_goblin'];
  return {
    seed: 12345,
    firstPlayer: 0,
    skipMulligan: true,
    players: [
      { name: playerName, avatar, faction: 'EMBER', deck: playerDeck, keepDeckOrder: true, heroPowerId: 'hp_ember' },
      { name: TUTORIAL_OPPONENT.name, avatar: TUTORIAL_OPPONENT.avatar, faction: TUTORIAL_OPPONENT.faction, deck: oppDeck, keepDeckOrder: true, heroHealth: 12, heroPowerId: null },
    ],
  };
}

/** Scripted opponent: plays its cheapest card each turn and never attacks (a patient teacher). */
export function tutorialOpponentAction(state: GameState): GameAction {
  const p = state.players[1];
  const playable = p.hand
    .filter((c) => c.cardId !== 'token_aether_shard' && canPlayCard(state, 1, c).ok)
    .sort((a, b) => (getCard(a.cardId)?.manaCost ?? 0) - (getCard(b.cardId)?.manaCost ?? 0));
  // Play the Guard dummy on turn 2 to teach Guard.
  const dummy = playable.find((c) => c.cardId === 'tut_dummy');
  const pick = state.turn >= 4 && dummy ? dummy : playable.find((c) => c.cardId !== 'tut_dummy');
  if (pick && p.board.length < 3) return { type: 'PLAY_CARD', player: 1, cardUid: pick.uid };
  return { type: 'END_TURN', player: 1 };
}

export type TutorialHighlight = 'hand' | 'end-turn' | 'energy' | 'enemy-hero' | 'my-board' | 'enemy-board' | 'sigil' | null;

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
  highlight: TutorialHighlight;
  /** null = wait for the "Next" button. */
  done: ((events: GameEvent[], state: GameState) => boolean) | null;
}

const played = (events: GameEvent[], type: string) => events.some((e) => e.type === 'CARD_PLAYED' && e.player === 0 && getCard(e.cardId)?.cardType === type);

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome', title: 'Welcome, Warden', text: 'Each Warden starts with 30 Health. Reduce the enemy Warden to 0 to win. Instructor Hale starts with only 12 today.', highlight: 'enemy-hero', done: null },
  { id: 'energy', title: 'Energy', text: 'Cards cost energy, shown in the blue gem. You gain one energy crystal each turn, up to 10, and refill every turn.', highlight: 'energy', done: null },
  { id: 'play-unit', title: 'Play a unit', text: 'Drag Shard Squire onto the battlefield, or click it. Glowing cards are playable right now.', highlight: 'hand', done: (ev) => played(ev, 'UNIT') },
  { id: 'end-turn', title: 'End your turn', text: 'New units need a turn to ready themselves before attacking. Press End turn.', highlight: 'end-turn', done: (ev) => ev.some((e) => e.type === 'TURN_ENDED' && e.player === 0) },
  { id: 'attack', title: 'Attack', text: 'Your Squire is ready. Click it (or drag from it) and choose the enemy Scrap Goblin. Both units deal damage to each other at the same time.', highlight: 'enemy-board', done: (ev) => ev.some((e) => e.type === 'UNIT_ATTACKED' && e.player === 0) },
  { id: 'spell', title: 'Cast a spell and target', text: 'Spark Bolt deals 2 damage. Play it and pick a target — try the enemy Warden.', highlight: 'hand', done: (ev) => ev.some((e) => e.type === 'SPELL_CAST' && e.player === 0) },
  { id: 'end-turn-2', title: 'Keep the pressure on', text: 'Play more units if you can, then end your turn.', highlight: 'end-turn', done: (ev) => ev.some((e) => e.type === 'TURN_ENDED' && e.player === 0) },
  { id: 'sigil', title: 'Your Warden Sigil', text: 'Every Warden has a Sigil: a power you can use once per turn. Yours is Cinder Bolt — 2 energy, 1 damage to an enemy. Click the crystal next to your portrait (hover it to read what it does), then pick a target.', highlight: 'sigil', done: (ev) => ev.some((e) => e.type === 'HERO_POWER_USED' && e.player === 0) },
  { id: 'win', title: 'Finish the fight', text: 'Units with Guard must be attacked first — hover the shield icon to learn more. Attack with your units and bring the enemy Warden to 0 Health.', highlight: 'enemy-hero', done: (ev) => ev.some((e) => e.type === 'GAME_ENDED') },
];
