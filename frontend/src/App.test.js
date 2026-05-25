import { render, screen } from '@testing-library/react';

import App from './App';

test('renders TeamPulse title', () => {

  render(<App />);

  const titleElement =
    screen.getByText(/TeamPulse/i);

  expect(titleElement)
    .toBeInTheDocument();
});