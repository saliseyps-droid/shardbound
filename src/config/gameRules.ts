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
  turnTimerSeconds: 120,
  /** The countdown becomes visible for the last N seconds of the turn. */
  turnTimerWarningSeconds: 30,
} as const;

export const DECK_RULES = {
  deckSize: 30,
  maxCopies: 2,
  maxLegendaryCopies: 1,
  /** Decks may only contain cards of the Warden faction plus Neutral cards. */
  maxFactions: 1,
  maxDecks: 18,
  maxDeckNameLength: 28,
} as const;
