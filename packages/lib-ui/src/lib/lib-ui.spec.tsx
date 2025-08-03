import { render } from '@testing-library/react';

import GigSportXLibUi from './lib-ui';

describe('GigSportXLibUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GigSportXLibUi />);
    expect(baseElement).toBeTruthy();
  });
});
