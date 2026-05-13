import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <h1>Page introuvable</h1>
        <Link to="/">Retour au socle</Link>
      </section>
    </main>
  );
}
