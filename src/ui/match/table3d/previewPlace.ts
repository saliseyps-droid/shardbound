/** Where the floating card preview stands beside a unit (screen px): right of it if it fits, else left; vertically centred on it, kept on screen. */
export function previewPlace(unit: { left: number; top: number; width: number; height: number }, card: { w: number; h: number }, view: { w: number; h: number }) {
  const gap = 16;
  const margin = 8;
  const right = unit.left + unit.width + gap;
  const left = right + card.w <= view.w - margin ? right : unit.left - gap - card.w;
  const top = Math.max(margin, Math.min(view.h - card.h - margin, unit.top + unit.height / 2 - card.h / 2));
  return { left, top };
}
