# Shardbound

An original single-player digital trading card game. You bind Shards of the broken Sundered Crown as a Warden, build decks from six factions, and play AI opponents in practice matches and a three-chapter campaign. Rewards feed a full collection economy: packs, crafting, quests, daily rewards and levels.

```
npm install
npm run dev        # http://localhost:5173
npm test           # 109 automated tests (engine, AI, packs, economy, persistence, end-to-end)
npm run build      # type-check + production bundle
npm run build:html # one self-contained file: dist-html/shardbound.html (open by double-click, works offline)
```

## Gameplay loop

Play matches, earn Gold and XP, buy boosters, open them, add the new cards to decks, fight stronger bots, complete quests, and repeat. Every step is connected and persisted. `tests/integration.test.ts` exercises the whole loop against IndexedDB, and in the running app the same flow works through the UI.

## The world

Aethra's Sundered Crown has shattered into ten thousand Shards. Six factions race to claim them (full lore is in the in-game Lore screen and `src/data/factions.ts`):

| Faction | Identity | Archetypes |
|---|---|---|
| Cinder Legion | Aggression, direct damage, Burn | Blitz, Pyromancy |
| Thornweald Circle | Healing, growth, buffs, Guard | Overgrowth, Wellspring |
| Brass Dominion | Constructs, Armor, energy ramp | Assembly Line, Bulwark |
| Lumen Conclave | Spells, draw, manipulation | Spellweave, Starlit Control |
| Hollow Choir | Sacrifice, Last Breath, resurrection | Requiem, Offering |
| Rimetide Court | Tempo, Freeze, bounce, delayed effects | Deep Freeze, Undertow |
| Wanderers (Neutral) | Flexible utility | — |

The collection holds 164 collectible cards: 23 per faction plus 26 neutral, across 2 sets (Shardfall, Tides of the Hollow Deep). There are also tokens, and 18 keywords, each with a tooltip and tests: Guard, Rush, Swift, Drain, Barrier, Ambush, Ward, Frenzy, Venom, Regenerate, Empower, Echo, Fleeting, On Deploy, Last Breath, Overcharge, Burn and Freeze.

## Match rules (`src/config/gameRules.ts`)

- Each Warden starts with 30 Health. Opening hands are 3 cards (first player) and 4 cards plus an Aether Shard (second player), with a mulligan.
- Energy gains +1 per turn up to 10 and refills each turn. Every Warden also has a once-per-turn Warden Sigil (hero power).
- Limits: hand 10 (overdrawn cards burn), board 7, relics 3, one location per side.
- Drawing from an empty deck causes escalating fatigue damage. There is a turn timer abstraction and a concede action.
- Decks are exactly 30 cards, with at most 2 copies of a card (1 for Legendaries). A deck may only contain cards of its Warden faction plus Neutral cards.

## Architecture

```
src/
  core/         seeded RNG (serialisable), utilities
  config/       ALL balance values: rules, economy, pack odds, crafting, XP/levels, quests, daily rewards
  game/         card & effect type model, data validation, rules-text generator
  data/         cards (one file per faction), keywords, factions/lore, hero powers, opponents & campaign, starter decks
  engine/       pure deterministic rules engine (no React)
  ai/           action search, evaluation, difficulty configs, Web Worker client
  domain/       pure player-progress logic: decks, packs, economy, quests, daily, progression, match results
  persistence/  KeyValueStore (IndexedDB / memory), repositories, save migrations
  services/     GameService: async "game server" facade over domain + repositories
  state/        Zustand stores (account mirror, match controller, settings, UI)
  audio/        WebAudio synthesized SFX + generative music (no external assets)
  i18n/         localization lookup with English fallback
  ui/           components (card frame, procedural art, tooltips), screens, match board
```

Dependencies only point downward. The UI never touches IndexedDB, and game logic never touches React.

### Rules engine (`src/engine`)

- `applyAction(state, action) → { state, events, error? }` is a pure transition. The input is structured-cloned, never mutated, and illegal actions return the old state with an error. Actions are `MULLIGAN`, `PLAY_CARD`, `ATTACK`, `HERO_POWER`, `END_TURN` and `CONCEDE`.
- Every change emits a typed `GameEvent` such as `CARD_PLAYED`, `DAMAGE_DEALT`, `UNIT_DIED` or `TURN_STARTED`. Events drive triggers, UI animation, audio, quest stats and the debug log.
- **Trigger pipeline** (`triggers.ts`): events collect listening abilities (ally summoned or died, spell cast, card drawn, healed, damaged, turn start/end, and so on) into a FIFO queue.
  - Each queued trigger has a dedupe key, so it cannot fire twice for one event.
  - Depth and resolution-count limits stop infinite loops.
  - Triggers whose source died or was silenced are skipped.
- **Effect executor** (`effects.ts`): about 25 reusable effect types, including `DEAL_DAMAGE`, `HEAL`, `BUFF`, `DRAW_CARDS`, `SUMMON`, `DESTROY`, `RETURN_TO_HAND`, `APPLY_STATUS`, `CREATE_CARD`, `COPY_CARD`, `STEAL_CARD`, `TAKE_CONTROL`, `TRANSFORM`, `RESURRECT`, `REDUCE_COST` and `GAIN/DESTROY_ENERGY`.
  - Effects are aimed with target selectors such as `TARGET`, `ALL_ENEMIES`, `RANDOM_ENEMY_UNIT` and `ADJACENT`.
  - Amounts can be value expressions, and conditions gate effects.
  - Continuous stat, keyword and cost auras are computed on read.
- **State-based checks** (`ops.ts`) run after every effect:
  - Deaths are processed in play order; Last Breath is queued before death listeners.
  - Game over is checked, including draws.
  - Barrier, Venom, Drain, Ambush and Armor are applied inside `dealDamage`.
- **Determinism**: the RNG state lives inside `GameState`, so the same seed and actions produce the same game. This is tested.

Adding a card means adding data only. For example:

```ts
{ id: 'emb_new', name: '…', cardType: 'UNIT', faction: 'EMBER', rarity: 'RARE', set: 'CORE', collectible: true,
  manaCost: 3, attack: 3, health: 2, keywords: ['SWIFT'],
  abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMY_UNITS' }] }] }
```

Rules text is generated from the data (`describe.ts`). Invalid cards are rejected at load and logged, so they never crash the app. `tests/cards.test.ts` plays every collectible card in a live game.

### AI (`src/ai`)

- **Hidden information**: `determinize` gives the AI a belief state. The opponent's hand and deck become placeholders, the AI's own deck is reshuffled, and the RNG is reseeded. The AI uses the same `applyAction` and legal-move generator as the player.
- **Evaluation**: the heuristic uses tunable weights for hero health with a danger curve, unit value (stats, keywords, abilities), board and threat priority, card advantage, relics and locations, energy advantage, fatigue, and lethal threat in both directions.
- **Difficulty**:
  - Easy is greedy and sometimes blunders or passes, with lower threat weighting.
  - Normal plays greedily, one ply per action, and checks for lethal.
  - Hard runs a beam search over 3-action sequences.
  - Expert runs a 4-action beam and also simulates the opponent's attack response.
- **Personalities**: aggressive, control, swarm and balanced modify the weights.
- **Performance**: decisions run in a Web Worker, with an inline fallback. Expert's worst-case decision is about 0.6 s.

### Player data (`domain` → `services` → `persistence`)

- `GameSave` has typed slices:
  - `profile` (level, XP, Gold, Essence, W/L/D, statistics)
  - `collection` (per-card counts of Normal, Foil and Prismatic)
  - `decks`
  - `economy` (unopened packs, pity counters)
  - `quests`, `daily`, `pve`, `matchHistory`, `recentRewards`
- All mutations are pure domain functions returning a new save or a `Result` error. `GameService` applies them, notifies the Zustand mirror, and persists only the changed slices in one IndexedDB transaction. Writes are serialized, and a failed write is retried in full on the next change.
- Separate repositories exist for Player, Collection, Deck, Match and Progress. Replacing `GameService`'s internals with HTTP calls gives cloud saves and server-side packs or economy without UI changes.
- **Save versioning**: `saveVersion` plus ordered migrations (`persistence/migrations.ts`). Loading also repairs data field by field: unknown cards are dropped, invalid numbers are clamped, and missing decks are restored. A corrupted save is backed up and the player is offered a fresh start instead of a crash.

### Packs (`domain/packs.ts`, odds in `config/economy.ts`)

- Each pack has 4 standard slots and 1 slot guaranteed Rare or better.
- Pity guarantees an Epic within 10 packs and a Legendary within 30.
- Duplicate protection prefers cards not yet owned at playset size.
- Variants: Foil 4%, Prismatic 0.5%. They are cosmetic only and cost more to craft.
- Generation is seeded and statistically tested over 20,000 packs.

## Online play

Play → *Play a friend online* creates a match link (`#/join/CODE`). The friend opens it, picks a deck and joins.

- Peer-to-peer over WebRTC (PeerJS public signalling); no game server needed.
- The host is authoritative: it runs the engine, validates the guest's deck and every action, and sends the guest a *mirrored, redacted* view (`src/net/view.ts`) — the guest never receives the host's hand, either deck order or the RNG seed.
- Heartbeat-based disconnect detection; the remaining player wins. Online matches give the same Gold, XP and quest progress as normal matches.
- Limitation: collection ownership of the guest can't be verified without a server, and the host's own browser technically holds full state.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: install → tests → build → GitHub Pages.

## Screens

Loading, profile creation, Home, Play (bot select with difficulty), Campaign (13 encounters including 5 bosses with special rules), Match board, Results, Collection (virtualized grid with filters, stats, crafting and recycling), Card inspector, Deck list, Deck editor (validation, mana curve, auto-complete), Pack inventory and opening, Shop, Quests and daily rewards, Profile, Match history, Settings, Lore, Tutorial (scripted), and Debug (development builds only, at `#/debug`).

Match controls:
- Drag a card to the board, or click it. Targeted cards and attacks show an arrow; click or drop on a highlighted target.
- Right-click inspects a card; Esc cancels targeting; E ends the turn.

## Testing

`tests/` covers:
- engine rules and every keyword interaction
- card database validity (every card playable)
- AI legality, lethal detection, trades, and difficulty strength
- simulated AI-vs-AI games across all faction pairings
- pack distribution, pity and duplicate protection
- economy: purchase, insufficient funds, crafting, recycling
- deck validation, quests, daily rewards, levels, match rewards
- persistence round trips, migrations, corruption handling
- match-controller race conditions
- the end-to-end definition-of-done flow
