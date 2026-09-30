/** Core match rules. Every rules-engine constant lives here. */
export const GAME_RULES = {
  heroStartingHealth: 30,
  startingHandFirst: 3,
  startingHandSecond: 4,
  cardsDrawnPerTurn: 1,
  maxHandSize: 10,
  maxBoardSize: 7,
  maxRelics: 3,
  /** Becomes 1 on the first turn start. */
  startingMaxEnergy: 0,
  energyPerTurn: 1,
  maxEnergy: 10,
  /** Second player receives this token card to compensate tempo. */
  secondPlayerBonusCardId: 'token_aether_shard',
  /** Hard safety cap. Reaching it ends the game in a draw. */
  maxTurns: 90,
  /** Upper bound on trigger resolutions per action; protects against loops. */
  maxTriggerResolutionsPerAction: 250,
  maxTriggerDepth: 30,
  /** Seconds per turn for the human player; 0 disables. */
  turnTimerSeconds: 90,
} as const;

export const DECK_RULES = {
  deckSize: 30,
  maxCopies: 2,
  maxLegendaryCopies: 1,
  /** Non-neutral factions allowed in a deck (hero faction + one ally faction). */
  maxFactions: 2,
  maxDecks: 18,
  maxDeckNameLength: 28,
} as const;
