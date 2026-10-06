/**
 * Width of a card in the pack opening, from the window size.
 * - Phones held upright: three cards per row (3 + 2), sized so both rows, their labels and the
 *   summary with its buttons fit on the screen together.
 * - Phones held sideways (short screens): one row of five, sized from the height so the labels and
 *   the summary stay above the bottom edge.
 * - Everything else: one row of five, as large as fits (unchanged desktop sizing).
 */
export function packCardWidth(vw: number, vh: number): number {
  if (vw < 600 && vh > vw) {
    const byWidth = (vw - 32 - 2 * 8) / 3;
    const byHeight = (vh - 340) / 2.8;
    return Math.round(Math.max(90, Math.min(170, byWidth, byHeight)));
  }
  if (vh <= 520) {
    const byWidth = (vw - 48 - 4 * 12) / 5;
    const byHeight = (vh - 210) / 1.4;
    return Math.round(Math.max(90, Math.min(250, byWidth, byHeight)));
  }
  return Math.round(Math.max(120, Math.min(250, (vw - 160) / 5.8, (vh - 330) / 1.4)));
}

/** Width of the sealed pack before opening: never so tall that the hint and Back button leave a short screen. */
export function packHeroWidth(cardW: number, vh: number): number {
  return Math.round(Math.min(260, cardW * 1.15, (vh - 170) / 1.8));
}
