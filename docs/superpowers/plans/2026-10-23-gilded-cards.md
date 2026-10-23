# Gilded Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth card variant, Gilded (gold full-art with a slowly living picture), sold only through a new 2500-Gold pack, Forbidden Spellbook.

**Architecture:** `GILDED` joins the `Variant` union and `VARIANTS` list (last, as the most valuable), so every generic loop (migration repair, surplus, recycle-all) picks it up; the remaining hand-written `NORMAL + FOIL + PRISMATIC` sums and Foil/Prismatic branches get a Gilded case. The pack reuses the Prismatic pack code path with its own `PackId`. The look is a CSS layout variant of `CardView` (`card-gilded`) and of the board unit (`is-gilded`) in a new stylesheet.

**Tech Stack:** TypeScript, React, Vite, Vitest, plain CSS; Python (Pillow, numpy) for the pack cut-out.

**Spec:** `docs/superpowers/specs/2026-10-23-gilded-cards-design.md` (visual reference: `.superpowers/brainstorm/2810-1792762629/content/three-finishes-v2.html`, third row, `.v-gild.drift`)

## Global Constraints

- Variant id `GILDED`; label "Gilded", Czech "Zlacená". Pack id `GILDED`, name "Forbidden Spellbook", price 2500 Gold, 5 cards, every card Gilded, all sets (same pool as the Prismatic pack), Legendary pity 10.
- Tagline (en): "Gilded pack: five Gilded cards from every set. A Legendary at least every ten packs."
- Gilded cannot be crafted; recycling pays `CRAFTING.variantMultiplier.GILDED = 16` × base.
- No Gilded from normal set packs (`variantWeights` unchanged), Nightmare rewards or Divine Ascension.
- In matches the best variants go first: Gilded, then Prismatic, then Foil.
- Motion: no tilt, no pointer handling. Animate `transform`/`opacity` only. `.performance-mode` and `prefers-reduced-motion: reduce` stop the pan and light pulse.
- All player-facing text through `t()`/`tn()` with Czech entries (`tests/i18nCoverage.test.ts`). Patch-notes entry en + cs. Ship: merge to `main` and push (deploys GitHub Pages).

## Review Focus

- Old saves (no `GILDED` key in collection entries, no `GILDED` pity/pack counts) load without errors and show 0 Gilded → test in Task 1.
- An online guest claiming `GILDED` copies beyond the copies in its deck is clamped like Prismatic → test in Task 3.
- "Recycle all surplus" keeps Gilded copies before Prismatic/Foil/Normal → test in Task 1.
- Card with a long name / long rules text in the Gilded layout at `xs`/`sm` sizes (hand, deck list) does not overlap the stat gems → visual check in Task 4.
- Buying the pack with less than 2500 Gold is refused and leaves the save unchanged → test in Task 2.

---

### Task 1: Gilded variant in the collection and economy

**Files:**
- Modify: `src/game/types.ts:17-18`, `src/domain/save.ts:199-206`, `src/config/economy.ts` (`CRAFTING.variantMultiplier`), `src/domain/economy.ts` (`craftCard`), `src/domain/daily.ts:54`, `src/services/gameService.ts:390`, `src/data/achievements.ts:110,285`
- Test: `tests/cardVariants.test.ts` (extend)

**Interfaces:**
- Produces: `Variant = 'NORMAL' | 'FOIL' | 'PRISMATIC' | 'GILDED'`, `VARIANTS = ['NORMAL','FOIL','PRISMATIC','GILDED']`; `emptyVariants()` includes `GILDED: 0`; `ownedCopies` counts it; `craftCard(save, id, 'GILDED', now)` returns `err('Gilded cards cannot be crafted.')`.

- [ ] **Step 1: Write failing tests** in `tests/cardVariants.test.ts`:
  - `gilded copies count as owned`: `ownedCopies` of an entry `{NORMAL:0,FOIL:0,PRISMATIC:0,GILDED:2}` is 2.
  - `gilded cannot be crafted`: rich save, `craftCard(save, someCommonId, 'GILDED', 1)` → `ok === false`, essence unchanged.
  - `gilded recycles for 16x`: `recycleValue(id, 'GILDED') === recycleValue(id, 'NORMAL') * 16`.
  - `surplus keeps gilded first`: card with max 2, counts `{NORMAL:1,FOIL:0,PRISMATIC:1,GILDED:1}` → `surplusCopies` = `{NORMAL:1,FOIL:0,PRISMATIC:0,GILDED:0}`.
  - `old saves get GILDED 0`: run `migrateSave` (the repo's migration entry in `src/persistence/migrations.ts`) on a v5 save whose collection entry lacks `GILDED` → entry has `GILDED: 0`.
- [ ] **Step 2:** `npx vitest run tests/cardVariants.test.ts` → the new tests fail.
- [ ] **Step 3:** Implement: extend the type and list; `emptyVariants`/`ownedCopies`; add `GILDED: 16` to `variantMultiplier`; early refusal in `craftCard`; add `+ GILDED` to the sums in `daily.ts` and `gameService.ts`; achievements: `shinyCards` counts `FOIL + PRISMATIC + GILDED`, description "Own 15 different cards in Foil, Prismatic or Gilded." (update its Czech entry). No save version bump: the migration repair already loops `VARIANTS`.
- [ ] **Step 4:** `npx vitest run` → all pass; `npx tsc --noEmit` → no errors (it will list every `Record<Variant, …>` literal that needs a `GILDED` key; add them, labels in UI maps go to Task 4 but must compile now: use `'Gilded'`).
- [ ] **Step 5:** Commit `Gilded variant in the collection: counted, recycled at 16x, never crafted`.

### Task 2: Forbidden Spellbook pack (domain)

**Files:**
- Modify: `src/config/economy.ts` (`PackId`, new `GILDED_PACK`, `packInfo`, `SHOP_OFFERS`), `src/domain/packs.ts`, `src/domain/economy.ts:24` (`buyOffer` reward source)
- Test: create `tests/gildedPack.test.ts` (mirror `tests/prismaticPack.test.ts`)

**Interfaces:**
- Consumes: `Variant` with `GILDED` (Task 1).
- Produces: `PackId = SetId | 'PRISMATIC' | 'PRISMATIC_LEGEND' | 'GILDED'`; `GILDED_PACK = { price: 2500, name: 'Forbidden Spellbook', tagline: <Global Constraints>, pityLegendary: 10 }`; offer `{ id: 'gilded_1', setId: 'GILDED', packs: 1, price: GILDED_PACK.price, label: '1 Pack' }`.

- [ ] **Step 1: Write failing tests** in `tests/gildedPack.test.ts`:
  - `holds five Gilded cards from every set`: 60 packs, every card `variant === 'GILDED'`, sets seen = `['ABYSS','CORE','DEEP','DRAGON','RECKONING']`, no card with `rewardOnly`.
  - `guarantees a Legendary within ten packs`: as the Prismatic test, `longest < GILDED_PACK.pityLegendary`.
  - `is bought for 2500 Gold and opened from the inventory`: gold 3000 → 500 after buying, `economy.packs.GILDED === 1`, opening gives `GILDED > 0` for each card and `economy.packs.GILDED === 0`.
  - `is refused with less than 2500 Gold`: gold 2499 → `ok === false`.
  - `normal set packs never roll Gilded`: 500 CORE packs, no `GILDED` variant.
- [ ] **Step 2:** `npx vitest run tests/gildedPack.test.ts` → fail.
- [ ] **Step 3:** Implement: in `generatePack` treat `GILDED` like `PRISMATIC` (pity from `GILDED_PACK.pityLegendary`, variant `'GILDED'`); `pickCard` draws from every set for `GILDED`; `buyOffer` pushes the "Purchased Forbidden Spellbook" reward like the Prismatic packs. Prefer a small helper (e.g. `allSetsPack(id)`) over repeating `id === 'PRISMATIC' || …` checks.
- [ ] **Step 4:** `npx vitest run` → all pass.
- [ ] **Step 5:** Commit `Forbidden Spellbook: a 2500-Gold pack of five Gilded cards from every set`.

### Task 3: Gilded copies in matches and online

**Files:**
- Modify: `src/engine/types.ts:22-27,60,242` (`CardVariant`), `src/engine/game.ts:102-105`, `src/domain/matchSetup.ts:48-62`, `src/net/lobby.ts:71-90`
- Test: `tests/cardVariants.test.ts` (or the existing matchSetup/net tests), extend

**Interfaces:**
- Produces: `CardVariant = 'FOIL' | 'PRISMATIC' | 'GILDED'`; `deckVariants` returns `GILDED` counts first.

- [ ] **Step 1: Write failing tests:**
  - `deckVariants puts gilded first`: deck `{x: 2}`, owned `{NORMAL:1, FOIL:1, PRISMATIC:1, GILDED:1}` → `{ x: { GILDED: 1, PRISMATIC: 1 } }`.
  - `the first copies in a match are gilded`: `createGame` with `variants: { x: { GILDED: 1, FOIL: 1 } }` and two copies of `x` in the deck → one instance `GILDED`, one `FOIL`.
  - `a guest cannot claim more gilded copies than it has`: `sanitizeVariants` (export it if needed, or test through the lobby entry point the existing net tests use) with deck of 1 `x` and claim `{ GILDED: 5, PRISMATIC: 1 }` → `{ x: { GILDED: 1 } }`.
- [ ] **Step 2:** Run → fail.
- [ ] **Step 3:** Implement the `GILDED` → `PRISMATIC` → `FOIL` order in all three places.
- [ ] **Step 4:** `npx vitest run` → pass.
- [ ] **Step 5:** Commit `Gilded copies go into matches first, also online`.

### Task 4: The Gilded look on cards and board units

**Files:**
- Create: `src/ui/styles/gilded.css` (imported by `CardView.tsx`)
- Modify: `src/ui/components/CardView.tsx:170-235`, `src/ui/match/BoardParts.tsx:112,142`, `src/ui/styles/base.css:207-209` (performance mode), every variant label site: `CardInspector.tsx:15,44-45`, `collection/CardDetailPanel.tsx:20-33,47,138-160`, `packs/CardRewardReveal.tsx:75`, `packs/PackOpening.tsx:215`, `match/Overlays.tsx:501`, `screens/CampaignScreen.tsx:54`, `screens/DeckEditorScreen.tsx:429`, `screens/ShopScreen.tsx:24`, `screens/ProfileScreen.tsx:75-76,228`, `screens/DebugScreen.tsx:37`; Czech entries in `src/i18n/cs/ui/*`
- Test: `tests/cardVariants.test.ts` or a new `tests/gildedCard.test.tsx` (pattern: `tests/cardViewSilenced.test.tsx`)

**Interfaces:**
- Consumes: `Variant`/`CardVariant` with `GILDED`.
- Produces: `CardView` with `variant="GILDED"` renders root class `card-gilded`; board unit with `variant === 'GILDED'` gets `is-gilded`.

- [ ] **Step 1: Write failing tests:** render `CardView` with `variant="GILDED"` → root has `card-gilded`, contains `.card-shine`, does not contain `.card-prism-frame`; render with `PRISMATIC` → no `card-gilded`.
- [ ] **Step 2:** Run → fail.
- [ ] **Step 3:** Implement the look from the mockup (`.v-gild` + `.drift` rules in the reference HTML are the source; translate the class names onto `CardView`'s real structure):
  - full-art layout: art fills the card inside a 2.4cqw gold frame, `object-position: 50% 20%`, dark bottom gradient, name/type line/text block at the bottom above the stat gems, gold gradient name with a 4 s light sweep, gold cost/attack/health/rarity gems;
  - motion: art pan `14s ease-in-out infinite alternate` through `scale(1.12) translate(-3%,-2%)` → `scale(1.2) translate(2%,1%)` → `scale(1.14) translate(3%,-3%)`; radial light (50 % 30 %, `soft-light`) breathing opacity on 5 s; gold sheen via `.card-shine` (gold band, `overlay`, 6 s);
  - `.performance-mode` and `@media (prefers-reduced-motion: reduce)`: no pan, no pulse, no sheen;
  - board unit `is-gilded`: gold frame instead of faction frame, same pan + pulse on `.unit-art`, no sheen;
  - labels: "Gilded" everywhere a variant label is shown; deck-editor row badge for Gilded copies; Gilded row in the craft table shows no Craft button (recycle only); profile "Foil and prismatic" stat counts Gilded and is renamed "Foil, prismatic and gilded"; Shop variant-chance table unchanged (Gilded is not in normal packs).
- [ ] **Step 4:** `npx vitest run` (incl. `i18nCoverage`) → pass; `npx tsc --noEmit` → clean.
- [ ] **Step 5: Visual check** with the dev server and chrome-devtools: a Gilded card at `xs`, `sm`, `md`, `lg` (long name e.g. "Isera of the Violet Blade", long text e.g. "Ignivar, Crown-Burner"), a Gilded unit on the board, performance mode on. Text must not overlap gems. Grant copies via `#/debug` or by editing the save.
- [ ] **Step 6:** Commit `Gilded cards: gold full-art whose picture slowly breathes, in hand, collection and on the board`.

### Task 5: Pack art, booster and shop/packs screens

**Files:**
- Modify: `tools/pack_cutout.py` (support this sheet's grid), `src/ui/components/packs/BoosterPack.tsx:10-36`, `src/ui/screens/ShopScreen.tsx:22`, `src/ui/screens/PacksScreen.tsx:15,47-71`
- Create: `src/assets/packs/gilded.webp`

**Interfaces:**
- Consumes: `PackId` `'GILDED'`, `GILDED_PACK` (Task 2).

- [ ] **Step 1: Cut the pack.** Sheet `C:\Users\m.vitek\Downloads\AaFpLuARQafd8q_alkjrNw-AaFpLuARfEf1h2B7BLI1bg.jpg` (3072×5440, 4×4, black-and-gold packs in gold-ruled cells on dark stone), bottom-right pack "FORBIDDEN SPELLBOOK" (col 3, row 3). The tool's `XS`/`ROWS` describe the old 1536-wide sheets: add a way to pass this sheet's cell geometry (e.g. `--grid x0,x1,x2,x3 y0:y1,…` or a named preset), measure the cells from the image. Keep the "MASTER COLLECTOR PACK" line. Output webp at the size of the other packs in `src/assets/packs/`.
- [ ] **Step 2: Verify the cut** (project rule): result on magenta, zoomed corners, outline over a brightened original. Look at all three images before going on.
- [ ] **Step 3:** `BoosterPack`: `PACK_ART.GILDED = gilded.webp`, palette entry, gold treatment (`is-gold`, sparkles; not the rainbow `booster-prism`). Shop lists `GILDED` with the Prismatic packs; Packs screen shows it the way it shows the Prismatic packs (also when you have none, with a shop link), pity bar max `GILDED_PACK.pityLegendary`.
- [ ] **Step 4:** `npx vitest run` (incl. `packLayout.test.ts`) → pass. Visual check of Shop and Packs screens, buy + open one pack (pack opening shows Gilded cards and labels).
- [ ] **Step 5:** Commit `Forbidden Spellbook in the shop, with its black-and-gold pack`.

### Task 6: Patch notes and ship

**Files:**
- Modify: `src/data/patchNotes.ts`, `src/i18n/cs/data/patchNotes.ts`

- [ ] **Step 1:** Add `0.62.0` (date 2026-10-23) at the top, kind `new`: the Gilded finish (look, how it moves, can't be crafted, recycles for more), the Forbidden Spellbook pack (2500 Gold, five Gilded cards from every set, Legendary at least every ten packs), Gilded copies go into matches first. Czech overlay: pack names stay English (as Gears of Invention / Divine Ascension in the cs notes); the variant is "Zlacená".
- [ ] **Step 2:** `npx vitest run` → all pass; `npm run build` → succeeds.
- [ ] **Step 3:** Commit `Gilded cards and the Forbidden Spellbook (0.62.0)`; merge to `main`, push; check the GitHub Pages deploy finishes and the live site shows 0.62.0.
