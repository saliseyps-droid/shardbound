import { useEffect, type ReactNode } from 'react';

/**
 * Stands in for TableView when its chunk fails to load (an old tab after a deploy): keeps the board
 * on screen and asks MatchScreen for the 2D layout, instead of leaving the table empty.
 */
export function TableFallback({ children, onUnavailable }: { boardUrl: string; children: ReactNode; onUnavailable: () => void }) {
  useEffect(() => onUnavailable(), [onUnavailable]);
  return <>{children}</>;
}
