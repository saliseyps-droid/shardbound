// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CardView } from '@/ui/components/CardView';

describe('CardView for a silenced unit', () => {
  it('marks the card as silenced and labels it', () => {
    const { container } = render(<CardView card="token_sentry" width={220} silenced />);
    expect(container.querySelector('.card')!.classList.contains('is-silenced')).toBe(true);
    expect(container.querySelector('.card-silenced-tag')?.textContent).toBe('Silenced');
  });

  it('shows a normal card without the label', () => {
    const { container } = render(<CardView card="token_sentry" width={220} />);
    expect(container.querySelector('.card')!.classList.contains('is-silenced')).toBe(false);
    expect(container.querySelector('.card-silenced-tag')).toBeNull();
  });
});
