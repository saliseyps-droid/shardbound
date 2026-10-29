import type { Bag, DecorContext } from './kit';
import { modelPiece } from './kit';
import type { Built } from './tables';

/** The door on the wall behind the player (Poly Haven, CC0): standing on the floor, its back to the wall. */

type Make = (ctx: DecorContext, bag: Bag) => Built;

export const DOORS: Record<string, Make> = {
  d_castle: (ctx, bag) => ({ root: modelPiece(bag, 'large_castle_door', { height: 26, anchor: 'back', max: ctx.limit }) }),
};
