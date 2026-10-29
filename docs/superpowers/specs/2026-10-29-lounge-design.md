# Lounge — design

## Intent
A new main-menu screen, **Lounge**, loads the player's game room (the same room that surrounds the
3D table in a match). The player looks around it with a free camera and furnishes it: every piece of
decor has a fixed, clearly marked **slot**; clicking a slot lists the pieces of that type, owned ones
to place and the rest to buy with Gold. The room is a long-term cosmetic goal with cheap and
expensive pieces alike.

## Where the room is seen
- In the Lounge.
- Around the 3D table in matches: against the AI always the player's own room; online the **host's**
  room (both players see it). 2D matches show no room.

## Slots (approved layout: `.superpowers/brainstorm/.../lounge-layout.html`)
Coordinates are the table scene's (z up, floor z = -9, room 72 × 60, player at -y).
| Slot | Kind | Default |
|---|---|---|
| table | table | Tavern table (today's) |
| rug | rug | Wine rug (today's) |
| floor | floor | Stone tiles (today's) |
| walls | walls (all four) | Stone walls (today's) |
| painting | painting (back wall, behind the opponent) | none |
| posterLeft, posterRight | poster | none |
| lights | lights (pair on the side walls) | Torches (today's) |
| furnBackLeft, furnBackRight, furnLeft, furnRight | furniture (any piece, any of the 4) | empty |
| ceiling | ceiling | none |

Furniture: one owned piece can stand in only one slot at a time (buying it twice is not offered);
posters likewise.

## Catalogue
Candidates in `lounge-catalog.html`, mixed general / fantasy / faction pieces, prices 150–2500 Gold
(card backs are 300–750 for reference). The user prunes the list; the kept items ship. Defaults are
free and owned by everyone.

## How it is made (Claude's call)
- Pieces are procedural Three.js (geometry + canvas textures) like today's room; posters and
  paintings reuse art already in the game. No downloaded models.
- A pure data module (`src/data/lounge.ts`): slots, items (id, slot kind, name, description, style,
  price), defaults, `RoomLayout = Record<SlotId, ItemId | null>`, validation (unknown or unowned ids
  fall back to the default).
- A room builder (`src/ui/lounge/roomDecor.ts`) builds the decor for a layout into a THREE scene,
  used by both `TableScene3D` and the Lounge screen; the table scene takes the layout as an argument.
- Profile: `ownedDecor: string[]`, `room: RoomLayout`; buy / place actions like card backs; synced to
  the cloud save like the other cosmetics.
- Online: the host sends its room layout in the match handshake; the guest validates ids against
  the catalogue (not ownership) and builds that room.
- Lounge screen: the room scene with the table in the middle, an orbit camera like the table's,
  numbered slot markers; a side panel lists the selected slot's pieces with Buy / Place.
- EN + CS text through `t()`, patch notes in both.

## Non-goals
Free placement of furniture, more than the listed slots, trading, animated characters.
