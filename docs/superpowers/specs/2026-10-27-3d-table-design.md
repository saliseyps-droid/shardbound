# 3D table for matches

## Intent

The match screen becomes a real 3D table, as in the approved mockup
(`.superpowers/brainstorm/4983-1793131802/content/board-table.html`): a wooden table in a dim room, the
board mat lying on it with relief and flickering light, thick 3D cards for units, Wardens in gold
hexagonal frames, card piles, energy crystals in the faction's colour, and a camera you can zoom.
The user asked for all of it ("celý to udělej"). A 2D / 3D switch stays, so the current look is one
click away.

## What the user decided (from the mockup review)

- **Camera:** a table view (tilt ≈ 0.62 rad, "Stůl"), the board filling the screen; zoom with the
  wheel / two fingers towards the pointer; double-click returns. No tilting of cards.
- **Units on the table:** thick cards (rounded corners, gold bevelled edge, slight gloss), leaning
  towards the player a little; card size between the old "small" and "medium". **No text on board
  cards**: the whole art in a gold frame, plus **ability icons** (Drain = red drop, Ward = blue
  shield, "after you cast a spell" = violet star, end of turn = gold hourglass, Guard = shield,
  Swift = bolt). Attack / Health as raised gems in the corners. Hovering a board card shows the
  full card with its text, flat, beside it.
- **Cards in hand:** full card with text, fanned at the near edge; hovering lifts one. The lift must
  not flicker when the pointer is near the card's lower edge (fixed in 2D on branch
  `hand-hover-flicker`, same rule in 3D).
- **Opponent's hand:** card backs fanned at the far edge, tilted towards the opponent.
- **Wardens:** narrow gold hexagonal frame (pointy top), portrait upright, a thin raised trim in the
  owner's faction colour; Health in a red shield.
- **Decks:** a pile of real card backs with gold edges, about one card in the pile per 2.4 in the
  deck; the count on top.
- **Energy:** tall cut crystals in gold sockets in a row by your Warden; lit ones in the faction's
  deep, saturated colour with a soft (not strong) glow; spent ones dark glass; "4/7" beside them.
- **Light:** bright enough to read (not dark); lantern above, candle flicker, a lamp following the
  pointer; numbers never show through things in front of them.
- **2D / 3D switch** in the match and in Settings.

## Approach (my call): a hybrid, not a rewrite

Everything that makes a match work today is HTML on the battlefield: dragging cards, attack arrows,
targeting (`data-entity`, `elementFromPoint`), damage numbers and other effects, the tutorial,
touch long-press, accessibility. Rewriting all of that for a WebGL canvas would take weeks and break
much of it. Instead:

1. **A WebGL scene behind the page** (Three.js, already in the app) draws the room, the table, the
   mat (the board image with a normal map from its brightness, as in the mockup), lights, and the
   3D bodies: card slabs, Warden frames, card piles, energy crystals, shadows.
2. **The HTML battlefield is laid onto the table** with the same camera: Three's `CSS3DRenderer`
   approach (a `matrix3d` transform computed from the camera every frame) puts the existing DOM
   rows, Wardens and piles exactly on the table plane. The browser's hit testing respects 3D
   transforms, so drag, drop, arrows and effects keep working unchanged.
3. **The 3D bodies follow the DOM, and WebGL draws them whole** *(my call, after the builder check)*:
   each frame the scene reads where the DOM units / Wardens / piles / energy are and places its
   meshes there. The WebGL meshes draw the full look (face, art, icons, gems, frames), lit by the
   scene's lights as in the mockup; in 3D the DOM elements on the table become **invisible hit
   targets** (still `data-entity`, still receiving drag, drop and clicks). Numbers are drawn depth-
   tested in WebGL, so nothing shows through a card in front.
   **Effects in 3D from step 1** *(my call)*: the DOM effect layer (damage numbers, heal, shields,
   arrows, drop hints) is drawn in screen space at the projected position of its unit, not on the
   tilted plane, until step 3 replaces them with 3D ones.
   **Animated boards until step 4** *(my call)*: in 3D the mat is the static board image with its
   normal map and the scene's flickering lights; the DOM `AnimatedBoard` layers are not shown in 3D.
4. **The hand, End turn, overlays, log and sidebar stay in screen space** (as in the mockup); the
   hand gets the 3D look through CSS (lean, shadow), not WebGL.

What this costs: the camera cannot orbit freely during a match (only zoom and pan; orbiting would
fight with card dragging), and anything that measures DOM rects must keep using
`getBoundingClientRect` (which already returns the projected box).

## Scope, in shippable steps (each one its own version, deployed)

1. **Table and camera**: WebGL room/table/mat/lights behind; DOM battlefield projected onto the table;
   2D / 3D switch (Settings + a button in the match); zoom and pan. Everything plays as before.
2. **3D bodies**: unit slabs (full art, icons, gems; hover preview with text), Warden frames with
   faction trim, card piles, energy crystals; hand lean and hover lift.
3. **Effects in 3D**: attack lunge (the unit lifts and arcs to its target, impact sparks and a small
   shake), death (the card shatters into shards), summon (the card drops onto the table with a puff
   of light), damage / heal / shield / freeze / burn particles at the unit, spells as projectiles
   with real light; card draw flying from the pile.
4. **Animated boards in 3D**: the `boardFx` candles, embers, dust, snow… as real point lights and
   particles over the mat.
5. **Polish**: the big moments over the table (Your turn banner, intro, Final Blow) reviewed in 3D;
   co-op (three rows) and puzzles; mobile layout and touch; performance mode.

## Rules that hold throughout

- **2D stays the fallback**: performance mode, reduced motion, no WebGL, and phones start in 2D; the
  switch can still turn 3D on (except without WebGL). *(My call:)* 3D supports desktop Chromium,
  Firefox and Safari; if a match runs below ~30 fps for several seconds the game offers to switch to
  2D. Shadows and point-light counts scale down on weak GPUs.
- **Default is 2D for everyone** (decided by the user): players turn 3D on themselves (Settings, or
  the switch in a match) until the 3D table is complete.
- The 2D/3D choice is stored per device (it is about the device's graphics), not cloud-synced.
- Three.js loads only in a match with 3D on (it is already a separate chunk).
- No gameplay change; the engine and the store are untouched except for presentation hooks.
- Every shipped step: tests, build, a look in the browser (2D and 3D), patch notes en + cs.

## Left to the builder

- Exact light values, materials, particle counts, as long as it matches the mockup's look.
- How the DOM is split between "on the table" and "screen space" for co-op and phones.
- Test coverage: pure helpers (projection, layout, icon mapping) unit-tested; the rest checked in
  the browser.
