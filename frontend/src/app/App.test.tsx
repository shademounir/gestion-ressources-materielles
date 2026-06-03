import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const loginResponse = {
  accessToken: 'valid-access-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    id: 'user-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
};

describe('Login page', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    window.history.pushState({}, '', '/login');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the login form', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /maroc ynov campus/i })).toBeInTheDocument();
  });

  it('validates credentials before calling the API', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/adresse email valide/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByRole('heading', { name: /pilotage des ressources materielles/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /navigation principale/i })).toBeInTheDocument();
    expect(screen.getByText(/ressources totales/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'SecurePassword123!',
        }),
      }),
    );
  });

  it('shows a clear error when credentials are rejected', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/identifiants invalides/i);
  });

  it('logs out from the authenticated layout', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('button', { name: /deconnexion/i }));

    expect(await screen.findByRole('heading', { name: /connexion/i })).toBeInTheDocument();
  });
});
