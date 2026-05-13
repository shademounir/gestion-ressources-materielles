import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App foundation', () => {
  it('allows entering the protected foundation area', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /entrer dans le socle/i }));

    expect(screen.getByRole('heading', { name: /socle technique pret/i })).toBeInTheDocument();
  });
});
