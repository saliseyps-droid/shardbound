# Gilded cards and the Forbidden Spellbook pack

## Intent

Shardbound has two cosmetic card finishes today: **Foil** (gold sheen sweep) and **Prismatic** (rainbow sheen, rotating
rainbow frame). The user wants a third, top-tier finish that looks different from "more shine": a **Gilded** full-art
card in a gold frame whose picture is alive. It is sold through its own premium pack, the way Prismatic cards are sold
through Gears of Invention.

The look was chosen in a side-by-side browser review of five directions (Shattered, Faction Ascended, Living Art,
Gilded Full-Art, Void-Touched), then a C+D combination. The user picked variant **"2 · Živý obraz – zlatý"**. The final
mockup is `.superpowers/brainstorm/2810-1792762629/content/three-finishes-v2.html` (third row); it is the visual
reference for this spec.

## Goals

- A new card variant **Gilded**, purely cosmetic like Foil and Prismatic.
- A new pack **Forbidden Spellbook**: works exactly like Gears of Invention (the `PRISMATIC` pack), but every card in it
  is Gilded, and it costs **2500 Gold**.
- Gilded copies show everywhere a Foil/Prismatic copy shows today (collection, deck editor, pack opening, rewards,
  hand and board in matches, online opponents).

## Non-goals

- No card tilt. The user explicitly rejected the card tilting/3D rotation; the card stays flat.
- No reaction to the mouse. (The "window" variant that pans the art with the cursor was rejected in favour of the one
  that moves on its own.)
- No per-card hand-made animation (no animated flames, cloaks…). The motion is one generic effect for every card.
- No Gilded drops from normal set packs, Nightmare rewards or the Divine Ascension pack.
- No new achievements. *(My call:)* Gilded counts toward the existing "Shimmering Collection" achievement
  ("Own 15 different cards in Foil, Prismatic or Gilded"); its text and Czech translation change accordingly.

## Anti-goals

- Strong glare or rainbow shine: the user asked to tone reflections down to a minimum during review. The gold sheen is
  slow and subtle.
- Animation that stutters or costs frame rate on the board: animate `transform`/`opacity` only (as `card.css` already
  does for `.card-shine`), and keep it off the main thread.

## The look (from the approved mockup)

**Card (`CardView`, class `card-gilded`):**
- Full-art: the illustration fills the whole card inside a thin gold frame (no body plate, no art window shape).
  Picture anchored to the upper part (`object-position: 50% 20%`) so faces are not cut.
- Frame: metallic gold gradient (`#fff1b8 → #d39b2a → #7a4f0e → #f5d27a → #8c5a12`), inner double trim line
  (light gold / dark brown / gold).
- Bottom: a dark gradient over the art (transparent at ~45 % height → near-black at the bottom) carrying the name,
  type line and rules text. A thin gold rule separates the type line from the text.
- Name: gold metallic text (gradient clipped to text) with a slow sweep of light through it (~4 s loop).
- Cost, Attack, Health gems: gold versions of the existing shapes; rarity gem gold.
- Text and name sit above the stat gems (they must not collide with the Attack/Health gems; the mockup needed
  `bottom: 17cqw` for the text block at 220 px).
- Rarity edge glow (`.card-inner::after`) stays, as on every card.

**Motion ("Živý obraz"):**
- The art slowly pans and zooms inside the frame like a film camera: a ~14 s alternate loop between roughly
  `scale(1.12) translate(-3%,-2%)`, `scale(1.2) translate(2%,1%)` and `scale(1.14) translate(3%,-3%)`.
- A soft light pulses in the picture: a radial highlight around 50 % / 30 %, `soft-light` blend, opacity breathing on a
  ~5 s loop.
- A slow, low-contrast gold sheen crosses the card (the `.card-shine` mechanism, gold band, ~6 s, `overlay` blend).
- No input handling at all; behaves the same on desktop, mobile and the board.
- Performance mode (the existing setting that drops board particles to 30 fps) and `prefers-reduced-motion` stop the pan
  and pulse; the card stays a static gilded full-art.

**Label:** "Gilded" (cs: "Zlacená") wherever Foil/Prismatic labels appear (`variant-label`, inspector, detail panel,
reward lists, deck-editor row badge).

**Board unit (`BoardParts`, class `is-gilded`):** the unit token keeps its shape; gold frame instead of the faction
frame, and the same slow art pan + light pulse inside (no sheen needed at that size).

## The pack

- `PackId` gains `'GILDED'`. Name **Forbidden Spellbook**, price **2500 Gold**, 5 cards, all Gilded, drawn from every set
  (same pool as Gears of Invention: `cardsBy` without a set; campaign/reward-only cards are already excluded by `POOL`).
- Same rarity slots and duplicate protection as the Prismatic pack; Legendary pity **10 packs**, tracked per pack id like
  the Prismatic pity.
- Shown in the Shop next to the Prismatic packs and on the Packs screen the same way as the Prismatic packs.
- Tagline (en): "Gilded pack: five Gilded cards from every set. A Legendary at least every ten packs."

**Pack art:** `C:\Users\m.vitek\Downloads\AaFpLuARQafd8q_alkjrNw-AaFpLuARfEf1h2B7BLI1bg.jpg`, a 4×4 sheet of
black-and-gold packs on a dark background (3072×5440). Use the bottom-right pack, "FORBIDDEN SPELLBOOK" (col 3, row 3).
- Cut it with `tools/pack_cutout.py` (always, per the project's pack-art rule) and verify on magenta, zoomed corners and
  the outline over a brightened original. The sheet layout differs from packs2/packs4/Prismm, so cell coordinates will
  need adding.
- Keep the "MASTER COLLECTOR PACK" line at the bottom; the user said it can stay (unlike the "15-card booster" labels
  removed elsewhere).
- Save as `src/assets/packs/gilded.webp`. The pack visual in `BoosterPack` gets a gold treatment like `is-gold`.

## Economy and collection

- `Variant` becomes `'NORMAL' | 'FOIL' | 'PRISMATIC' | 'GILDED'`; `CardVariant` gains `'GILDED'`.
- Collection entries get a `GILDED` count; a save migration fills `GILDED: 0` into existing entries.
- In matches the best variants go in first: Gilded, then Prismatic, then Foil (`matchSetup`, `engine/game.ts`,
  `net/lobby.ts` so online opponents see them too).
- Every place that sums `NORMAL + FOIL + PRISMATIC` must include `GILDED` (save helpers, daily, gameService,
  inspector, profile stats, "Foil and prismatic" profile stat).
- Surplus recycling keeps the most valuable variant first (Gilded before Prismatic).
- **Gilded cannot be crafted** (decided by the user): the only way to get one is the pack. The Craft button for the
  Gilded row is absent/disabled and `craftCard` refuses `GILDED`. **Recycling is allowed at 16×** the base recycle value
  (`CRAFTING.variantMultiplier.GILDED = 16`, used for recycling only).

## Release

- Ship it live when done (the user said "rovnou nasadit"): merge to `main` and push, which deploys GitHub Pages.
- Player-facing patch-notes entry (en + cs), version bump per the usual scheme.
- All new text through `t()` with Czech entries (coverage test enforces it).

## Left to the builder

- Exact keyframe values, timings and gradient stops beyond those above, as long as the result matches the mockup.
- How the Gilded full-art layout is structured in `CardView` (a layout variant of the existing card, or a separate
  branch), and how the board token is styled.
- Test coverage following the project's existing pack/economy/migration tests.
