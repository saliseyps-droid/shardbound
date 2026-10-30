// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CardView, EagerCardArt } from '@/ui/components/CardView';

describe('card pictures in a match', () => {
  it('load at once there (lazy loading waited on Safari for cards on the tilted 3D hand)', () => {
    const { container } = render(
      <EagerCardArt.Provider value>
        <CardView card="ast_amethyst_spark" width={120} />
      </EagerCardArt.Provider>,
    );
    expect(container.querySelector('img.card-art')!.getAttribute('loading')).toBe('eager');
  });
  it('stay lazy elsewhere (the collection shows hundreds)', () => {
    const { container } = render(<CardView card="ast_amethyst_spark" width={120} />);
    expect(container.querySelector('img.card-art')!.getAttribute('loading')).toBe('lazy');
  });
});
