// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TableFallback } from '@/ui/match/table3d/TableFallback';

describe('3D table that fails to load (e.g. its chunk is gone after a deploy)', () => {
  it('keeps the board on screen and asks for the 2D board', () => {
    const onUnavailable = vi.fn();
    const { getByText } = render(
      <TableFallback boardUrl="x.webp" onUnavailable={onUnavailable}>
        <section>Battlefield</section>
      </TableFallback>,
    );
    expect(getByText('Battlefield')).toBeTruthy();
    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });
});
