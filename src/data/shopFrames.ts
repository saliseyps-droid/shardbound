/**
 * Warden frames sold in the Shop (src/domain/frames.ts). They go with any faction and any deck;
 * the art is in src/ui/components/frames/ShopFrames.tsx. Names and descriptions are English
 * source text, translated at display time (src/i18n/cs/ui/portraits.ts).
 */
export interface ShopFrameDef {
  id: string;
  name: string;
  /** In Gold. */
  price: number;
  animated: boolean;
  description: string;
}

export const SHOP_FRAMES: ShopFrameDef[] = [
  { id: 'obsidian', name: 'Silver Obsidian', price: 2500, animated: false, description: 'Polished black stone with silver filigree on every corner and runes engraved along the band.' },
  { id: 'royal', name: 'Royal Purple', price: 2500, animated: false, description: 'Purple velvet trimmed with gold, a jewelled crown on top and a royal banner on either side.' },
  { id: 'aurora', name: 'Aurora', price: 5000, animated: true, description: 'Silver and night-blue enamel under a crescent moon, with the northern lights rippling above it.' },
  { id: 'wings', name: 'Shadow Wings', price: 5000, animated: true, description: 'Dark feathered wings rising behind your Warden, slowly lifting and settling.' },
];

const BY_ID = new Map(SHOP_FRAMES.map((f) => [f.id, f]));
export const getShopFrame = (id: unknown): ShopFrameDef | undefined => (typeof id === 'string' ? BY_ID.get(id) : undefined);
