import { useEffect, useState } from 'react';

/** Responsive grid card width for the current viewport. */
export function useCardWidth(scale = 1): number {
  const pick = () => {
    const w = typeof window === 'undefined' ? 1600 : window.innerWidth;
    const base = w >= 2300 ? 210 : w >= 1800 ? 180 : w >= 1500 ? 164 : 146;
    return Math.round(base * scale);
  };
  const [width, setWidth] = useState(pick);
  useEffect(() => {
    const onResize = () => setWidth(pick());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);
  return width;
}
