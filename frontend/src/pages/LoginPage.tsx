import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/useAuth';

export function LoginPage() {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  function handleFoundationLogin() {
    setAccessToken('foundation-token');
    void navigate('/');
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <h1>Connexion</h1>
        <p>Foundation d'authentification frontend. Le flux reel sera implemente par story Jira.</p>
        <button type="button" onClick={handleFoundationLogin}>
          Entrer dans le socle
        </button>
      </section>
    </main>
  );
}
