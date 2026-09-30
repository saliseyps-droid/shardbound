import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface Props<T> {
  items: readonly T[];
  /** Width of one cell (card width). */
  itemWidth: number;
  /** Height of one cell (card + badges). */
  itemHeight: number;
  gap?: number;
  /** Extra rows rendered above/below the viewport. */
  overscan?: number;
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  ariaLabel?: string;
  empty?: ReactNode;
}

/**
 * Windowed grid: only rows intersecting the viewport (plus overscan) are rendered,
 * so collections with thousands of cards scroll smoothly. Column count follows the
 * container width via ResizeObserver.
 */
export function VirtualCardGrid<T>({ items, itemWidth, itemHeight, gap = 16, overscan = 2, getKey, renderItem, className = '', ariaLabel, empty }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset scroll when the result set changes substantially (new filter).
  useEffect(() => {
    if (ref.current && ref.current.scrollTop > (items.length / Math.max(1, cols(size.width)) + 1) * (itemHeight + gap)) {
      ref.current.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function cols(width: number) {
    return Math.max(1, Math.floor((width - 8 + gap) / (itemWidth + gap)));
  }

  const columns = cols(size.width);
  const rowHeight = itemHeight + gap;
  const rows = Math.ceil(items.length / columns);
  const firstRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const lastRow = Math.min(rows - 1, Math.ceil((scrollTop + size.height) / rowHeight) + overscan);
  const usedWidth = columns * itemWidth + (columns - 1) * gap;
  const offsetX = Math.max(0, Math.floor((size.width - usedWidth) / 2));

  const cells: ReactNode[] = [];
  if (size.width > 0) {
    for (let r = firstRow; r <= lastRow; r++) {
      for (let c = 0; c < columns; c++) {
        const index = r * columns + c;
        if (index >= items.length) break;
        const item = items[index];
        cells.push(
          <div
            key={getKey(item)}
            className="vgrid-cell"
            role="listitem"
            style={{ transform: `translate(${offsetX + c * (itemWidth + gap)}px, ${r * rowHeight}px)`, width: itemWidth, height: itemHeight }}
          >
            {renderItem(item, index)}
          </div>,
        );
      }
    }
  }

  return (
    <div ref={ref} className={`vgrid ${className}`} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)} aria-label={ariaLabel}>
      {items.length === 0 ? (
        empty
      ) : (
        <div className="vgrid-inner" role="list" style={{ height: rows * rowHeight }}>
          {cells}
        </div>
      )}
    </div>
  );
}
