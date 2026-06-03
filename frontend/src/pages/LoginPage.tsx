import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../modules/auth/authService';
import { useAuth } from '../modules/auth/useAuth';

export function LoginPage() {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse email valide.');
      return;
    }

    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await login({
        email: normalizedEmail,
        password,
      });

      setAccessToken(response.accessToken);
      void navigate('/', { replace: true });
    } catch {
      setErrorMessage('Identifiants invalides ou compte non autorise.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <img
            className="login-logo"
            src="/assets/logo-maroc-ynov-campus.png"
            alt="Maroc Ynov Campus"
          />
          <span>Gestion des Ressources Materielles</span>
        </div>

        <div className="login-heading">
          <h1 id="login-title">Connexion</h1>
          <p>Accedez a votre espace de gestion.</p>
        </div>

        <form className="login-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <label className="form-field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              required
            />
          </label>

          <label className="form-field" htmlFor="password">
            <span>Mot de passe</span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              required
            />
          </label>

          {errorMessage ? (
            <p className="login-error" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          <button className="login-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  );
}
