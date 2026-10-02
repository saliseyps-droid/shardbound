# Warden Talents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single Warden Sigil with a per-deck talent tree: 5 abilities per faction, each with ranks I → II → III. Every deck spends exactly 5 points: one ability at III and one at II. Both abilities are usable or trigger in matches.

**Architecture:**
- Ability data lives in `src/data/wardenTalents.ts`. Every rank is a fully hand-written definition.
- The engine keeps the action name `HERO_POWER`, adds a `slot`, and stores `abilities[]` on `HeroState`.
- Passive abilities become a new listener source in `triggers.ts`.
- Decks carry `talents`. Load-time repair fills in a default build.
- The UI gets a talent tree in the deck editor and two ability slots in the match.

**Tech Stack:** Vite, React 19, TypeScript, Zustand, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-02-warden-talents-design.md` (contains the exact numbers for all 30 abilities and the boss table).

## Global Constraints

- 5 talent points, all spent. Exactly 2 abilities: one at rank III and one at rank II. Rank III requires rank II.
- In data, ranks are indexes `level: 0 | 1 | 2`. The player sees I / II / III. A pick at `level` costs `level + 1` points.
- Active abilities are used exactly like the old Sigil: click the crystal, pick the target with the arrow. No keyboard shortcuts.
- Bosses have their own 2 abilities, and the 5-point rule does not apply to them.
- Use only existing effects and triggers. The only new engine rule is `limitPerTurn` for passives.
- Player-facing text: "Warden ability", not "Warden Sigil".
- After the change: `npx tsc -p tsconfig.json && npx vitest run`, patch notes, `npm run build:html`, commit, push to `main`.

## Review Focus

1. A faction switch in the deck editor has to reset the build. Otherwise the deck holds abilities from another faction. Test: `validateDeck` reports `TALENTS` for a foreign ability.
2. Old saves without `talents`, or with a broken build, have to load with the default build. Test in `tests/persistence` / migration.
3. Both hero passive slots must not collapse into one dedupe key (`uid` null). Test: 2 passive abilities on the same trigger both resolve.
4. Online: a guest with an invalid build is rejected and a valid one is accepted. Test in `tests/netView.test.ts` / lobby.
5. `limitPerTurn` resets every turn. Test: Searing Wrath at rank I triggers once per turn, and again next turn.

---

### Task 1: Talent data and build validation

**Files:**
- Create: `src/data/wardenTalents.ts`
- Delete: `src/data/heroPowers.ts`. Its boss powers move into `wardenTalents.ts` as `BOSS` abilities.
- Test: `tests/talents.test.ts`

**Interfaces (Produces):**
```ts
export type TalentLevel = 0 | 1 | 2;
export interface ActiveLevel { cost: number; target?: TargetRequirement; effects: Effect[]; usesPerTurn?: number; description: string }
export interface PassiveLevel { abilities: Ability[]; limitPerTurn?: number; description: string }
export interface TalentAbility { id: string; faction: PlayableFaction | 'BOSS'; name: string; kind: 'ACTIVE' | 'PASSIVE'; levels: (ActiveLevel | PassiveLevel)[]; upgradeNotes: string[] }
export interface TalentPick { abilityId: string; level: TalentLevel }
export const TALENT_POINTS = 5;
export const FACTION_TALENTS: Record<PlayableFaction, TalentAbility[]>;
export const DEFAULT_BUILD: Record<PlayableFaction, TalentPick[]>;
export const PERSONALITY_BUILD: Record<PlayableFaction, Partial<Record<AiPersonality, TalentPick[]>>>;
export function getTalent(id: string): TalentAbility | undefined;
export function talentLevel(pick: TalentPick): ActiveLevel | PassiveLevel | undefined;
export function buildPoints(build: TalentPick[]): number;      // sum of level+1
export function validateBuild(faction: PlayableFaction, build: unknown): string | null;
export function defaultBuild(faction: PlayableFaction): TalentPick[];  // fresh copy
```

- [ ] Write `tests/talents.test.ts`:
  - every `DEFAULT_BUILD` and every `PERSONALITY_BUILD` passes `validateBuild`,
  - each faction has 5 abilities with 3 levels and 2 `upgradeNotes`,
  - `validateBuild` rejects 1 or 3 picks, duplicates, foreign abilities, II+II (4 points), I+III, and a level outside 0–2,
  - all 20 valid pairs (5 abilities × 4 partners, III+II) pass.
- [ ] Run `npx vitest run tests/talents.test.ts`. Expect FAIL (module missing).
- [ ] Implement `wardenTalents.ts` with exactly the values from the spec section "Obsah: 30 schopností frakcí":
  - Active levels use `target` / `effects` just like the old `HERO_POWERS`.
  - Passive levels hold `abilities: [{ trigger, effects, condition? }]`.
  - Boss abilities (`Caldera Eruption`, `Crushing Depths`, `Requiem Chorus`, `Crown Fragment`) have `faction: 'BOSS'` and one level each.
  - Validation is `picks.length === 2 && distinct && every faction === f && levels sorted === [1, 2]`.
- [ ] Run the tests. Expect PASS.
- [ ] Commit `feat: Warden talent data and build validation`.

### Task 2: Engine – two ability slots, passives, limitPerTurn

**Files:**
- Modify: `src/engine/types.ts` (HeroState, SideSetup, GameAction, GameEvent)
- Modify: `src/engine/game.ts` (createPlayer, startTurn, doHeroPower, applyAction)
- Modify: `src/engine/queries.ts` (canUseHeroPower)
- Modify: `src/engine/legal.ts`
- Modify: `src/engine/triggers.ts` (listenersFor, queueFor, runAbility event)
- Modify: `src/engine/context.ts` (AbilitySource.talentSlot)
- Modify: `tests/helpers.ts`, `tests/ai.test.ts`, `tests/cards.test.ts`, `tests/netView.test.ts`, `tests/simulation.test.ts` (heroPowerId → talents)
- Test: `tests/talentsEngine.test.ts`

**Interfaces:**
```ts
// types.ts
export interface HeroAbilityState { id: string; level: TalentLevel; uses: number }
HeroState: replaces heroPowerId/heroPowerUses with `abilities: HeroAbilityState[]`
SideSetup: replaces heroPowerId with `talents?: TalentPick[]`
GameAction: { type: 'HERO_POWER'; player; slot: number; target? }
GameEvent: { type: 'HERO_POWER_USED'; player; slot: number; abilityId: string; target? }
         | { type: 'HERO_ABILITY_TRIGGERED'; player; slot: number; abilityId: string }
// queries.ts
export function canUseHeroPower(state, playerId, slot: number): { ok: boolean; reason?: string }
export function activeLevelOf(state, playerId, slot): ActiveLevel | undefined
```

- [ ] Write `tests/talentsEngine.test.ts` (with `newGame({ talents0: [...] })` from the updated helper):
  1. Rime Touch III (slot 0) + Undertow II (slot 1): both slots usable in the same turn, each only once, and energy drops by their costs.
  2. A second use of slot 0 returns error `Already used this turn`.
  3. Without a target for Cinder Bolt → `A target is required`.
  4. Two passives on the same trigger, Reinforced Hull III + Kindled Fury II (TURN_END and TURN_START): both resolve, armor +3 after end of turn.
  5. Searing Wrath at rank I (`limitPerTurn: 1`): two spells in one turn deal 1 to the enemy hero, and next turn it triggers again.
  6. Determinism: same seed and actions give the same state.
  7. `getLegalActions` returns `HERO_POWER` for both active slots.
- [ ] Run. Expect FAIL.
- [ ] Implement:
  - `createPlayer`: `abilities: (side.talents ?? []).filter(p => getTalent(p.abilityId)).map(p => ({ id: p.abilityId, level: p.level, uses: 0 }))`.
  - `startTurn`: `for (const a of p.hero.abilities) a.uses = 0;` replaces `heroPowerUses = 0`.
  - `canUseHeroPower(state, player, slot)`: the level must be `ActiveLevel` (`'cost' in level`), then the same checks as before, with uses taken from `hero.abilities[slot].uses`.
  - `doHeroPower(ctx, player, slot, target)`: as before, but `level` comes from the slot. Emit `HERO_POWER_USED { slot, abilityId }`. The source is `{ kind: 'hero', uid: null, cardId: abilityId, controller, talentSlot: slot }`.
  - `listenersFor`: after location, for each slot with a `PassiveLevel` push `{ source: { kind: 'hero', uid: null, cardId: a.id, controller, talentSlot: i }, abilities: level.abilities, limit: level.limitPerTurn }`.
  - `queueFor`:
    - key `${event.seq}:${kind}:${uid ?? 'h' + talentSlot}:${index}`,
    - when `limit` is set and `hero.abilities[slot].uses >= limit`, skip; otherwise `uses++` on enqueue.
  - `runAbility`: when `source.kind === 'hero' && source.talentSlot !== undefined && passive`, emit `HERO_ABILITY_TRIGGERED`. Pass `passive: true` in the source from `listenersFor`.
  - `legal.ts`: loop over `hero.abilities.forEach((_, slot) => …)` with the same target logic.
  - `tests/helpers.ts`: `newGame` options `talents0?/talents1?: TalentPick[]` replace `hp0/hp1`. Update existing usages:
    - `FACTION_HERO_POWER[f]` → `DEFAULT_BUILD[f]`,
    - `'hp_ember'` → `DEFAULT_BUILD.EMBER`,
    - `{ type: 'HERO_POWER', player }` → add `slot: 0`.
- [ ] Run `npx tsc -p tsconfig.json && npx vitest run`. Expect PASS, apart from compile errors in the UI and domain, which Tasks 3–5 fix. tsc must be fully green at the end of Task 4. During Task 2 run only `npx vitest run tests/talentsEngine.test.ts tests/engine*.test.ts`.
- [ ] Commit `feat(engine): two Warden ability slots with passive triggers`.

### Task 3: Domain – deck talents, repair, match setup, bosses, online, tutorial

**Files:**
- Modify: `src/domain/decks.ts`:
  - `Deck.talents: TalentPick[]`,
  - issue code `TALENTS`,
  - `validateDeck` takes `Pick<Deck,'cards'|'heroFaction'|'name'> & { talents?: TalentPick[] }`. The talent check runs only when `talents !== undefined`, so online validation can call it without a deck.
- Modify: `src/services/gameService.ts`:
  - `createDeck` sets `talents: defaultBuild(heroFaction)`,
  - `duplicateDeck` copies `talents`,
  - `updateDeck` keeps `talents`.
- Modify: `src/domain/newAccount.ts` (starter decks get `talents: defaultBuild`).
- Modify: `src/persistence/migrations.ts`: during deck repair, `talents: validateBuild(f, d.talents) === null ? d.talents : defaultBuild(f)`. Same for restored starter decks.
- Modify: `src/domain/matchSetup.ts`:
  - `playerSide` → `talents: deck.talents`,
  - `opponentSide` → `talents: s?.talents ?? PERSONALITY_BUILD[faction][personality] ?? DEFAULT_BUILD[faction]`.
- Modify: `src/data/opponents.ts`: `SpecialRules.heroPowerId` → `talents?: TalentPick[]`, filled in from the spec's boss table. Descriptions change from "Warden Sigil: X." to "Warden abilities: X, Y."
- Modify: `src/net/lobby.ts`: `validateBuild(faction, side.talents)` replaces the `FACTION_HERO_POWER` check. Error: "Invalid Warden abilities."
- Modify: `src/ui/match/tutorial.ts`: the player gets `talents: [{ abilityId: 'wt_ember_cinder_bolt', level: 2 }, { abilityId: 'wt_ember_kindled_fury', level: 1 }]`, and the opponent gets `talents: []`.
- Find the guest's setup sender with `grep -rn "playerSide(" src` and make sure `talents` goes through.
- Test: extend `tests/talents.test.ts`, the migration test (`grep -ln migrateSave tests`) and `tests/netView.test.ts`.

- [ ] Tests:
  - `validateDeck` with a foreign or incomplete build gives `TALENTS`, and a valid one gives no issue,
  - `migrateSave` on a deck without `talents` gives `DEFAULT_BUILD`, and so does a broken build,
  - `validateRemoteSide` rejects `talents: [{ wrong }]` and accepts `DEFAULT_BUILD`,
  - `opponentSide` for each boss returns exactly 2 abilities that exist in `getTalent`.
- [ ] Run. Expect FAIL.
- [ ] Implement as described above.
- [ ] Run tests. Expect PASS.
- [ ] Commit `feat: decks carry Warden talent builds; bosses, AI and online use them`.

### Task 4: Match UI – two slots, log, passive flash

**Files:**
- Modify: `src/state/matchStore.ts`:
  - `Selection` `{ kind: 'power'; slot: number }`,
  - `clickHeroPower(slot: number)`,
  - `targetsFor` reads `activeLevelOf(game, HUMAN, sel.slot)`,
  - dispatch sends `slot: s.selection.slot`.
- Modify: `src/ui/match/BoardParts.tsx`:
  - `HeroPowerButton` becomes `HeroAbilities`, which renders one element per `hero.abilities`.
  - Active: the same button as today (cost, `is-usable`, `is-used`, `is-selected` when `selection.slot === slot`). `data-tutorial="sigil"` goes only on the first active slot.
  - Passive: `<span className="hero-power is-passive">` with the glyph and no cost. The class `is-flash` is set for 900 ms after a `HERO_ABILITY_TRIGGERED` event with this slot. Use the existing FX hook if one fits, otherwise local state through `useEffect` on `game.log` length.
  - Tooltip: `${name} ${['I','II','III'][level]}` plus the level `description`, with an "Active (n)" or "Passive" label.
- Modify: `src/ui/match/MatchScreen.tsx` (use `HeroAbilities`).
- Modify: `src/ui/match/Overlays.tsx`: `HERO_POWER_USED` → `${who} used ${talent.name}`, and `HERO_ABILITY_TRIGGERED` → `${talent.name} triggered`.
- Modify: `src/ui/styles/board.css`: `.hero-abilities` (flex column, gap 4px), `.hero-power.is-passive` (round, `cursor: default`), `.hero-power.is-flash` (glow animation).
- Modify: `src/ai/search.ts` (no change needed, `HERO_POWER → 4` applies to both).

- [ ] `npx tsc -p tsconfig.json` is fully green. `npx vitest run` passes.
- [ ] Browser check via puppeteer-core and `window.__tcg`:
  - a practice match shows 2 slots,
  - clicking an active slot with a target shows the arrow and the effect applies,
  - the passive slot flashes at end of turn,
  - screenshot.
- [ ] Commit `feat(ui): two Warden ability slots on the battlefield`.

### Task 5: Deck editor – talent tree

**Files:**
- Create: `src/ui/components/TalentTree.tsx`
- Modify: `src/ui/screens/DeckEditorScreen.tsx`:
  - a "Cards | Talents" switcher above `editor-pool`. The Talents mode renders `<TalentTree>` in place of the card pool,
  - remove `WardenSigilInfo`. In its place, a compact summary of the 2 chosen abilities, which switches to the Talents tab on click,
  - faction change → `talents: defaultBuild(f)`,
  - `dirty` also compares `JSON.stringify(talents)`.
- Modify: `src/ui/styles/decks.css` (remove `.sigil-*`, add `.talent-*`).
- Modify: `src/ui/components/meta/MetaWidgets.tsx` (deck box: 2 small ability icons with tooltips).

**Interfaces:**
```ts
export function TalentTree(props: { faction: PlayableFaction; build: TalentPick[]; onChange: (b: TalentPick[]) => void }): JSX.Element
export function toggleNode(build: TalentPick[], abilityId: string, rank: TalentLevel): TalentPick[] | string  // export from wardenTalents.ts, string = reason
```

- [ ] Test `toggleNode` in `tests/talents.test.ts`:
  - learn rank I on an empty build gives `[{id, 0}]`,
  - rank II without rank I gives "Learn rank I first",
  - a 3rd ability gives "Only 2 abilities",
  - beyond 5 points gives "No talent points left",
  - clicking a learned rank I removes the whole ability, and clicking rank II drops back to level 0.
- [ ] Run. Expect FAIL. Implement `toggleNode` in `wardenTalents.ts`. Expect PASS.
- [ ] `TalentTree`:
  - header "Talent points {spent} / 5" and a "Reset to default" button,
  - grid of 5 columns, each `[I, II, III]` from top to bottom with a connecting line,
  - node = button with the ability name (on I) or the rank number, ACTIVE/PASSIVE label and ⚡ cost of that rank,
  - states `is-learned`, `is-available`, `is-locked`,
  - `Tip` with the rank `description` plus `upgradeNotes[rank-1]`,
  - click → `toggleNode`; a string result → `toast(reason)` and the error sound.
- [ ] Browser check: build a valid build, save it, reload, and the build survives. A deck with an incomplete build shows the error and can't be played.
- [ ] Commit `feat(ui): Warden talent tree in the deck editor`.

### Task 6: Copy, live test, sim, patch notes, release

**Files:**
- Modify: `src/data/keywords.ts` (Ward text), `src/ui/match/tutorial.ts` (step "sigil": title "Your Warden abilities", text about 2 abilities: click the crystal of the active one), README (Match rules).
- Modify: `src/data/patchNotes.ts` (new entry "Warden Talents", minor version).
- Test: `tests/talentsLive.test.ts`.

- [ ] Live test: for every faction × ability × level, start a game with that pick in slot 0.
  - Active: put targets on the board (`board1: ['token_recruit']`, `board0: ['token_scrapbot']`), set energy to 10, play a `HERO_POWER` legal action for slot 0 (if one exists) and expect no error.
  - Passive: play 3 turns of `END_TURN` and expect no error.
- [ ] Sim (temp file outside `tests/`, see the balance memory): 600 NORMAL bot games with `DEFAULT_BUILD`, then all builds. Write the win-rates up for the user. Do not change numbers without the user's approval.
- [ ] `npx tsc -p tsconfig.json && npx vitest run`, `npm run build:html`.
- [ ] Commit, push, watch the deploy run.
