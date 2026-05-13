import { Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/useAuth';

export function MainLayout() {
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <strong>Gestion des Ressources Materielles</strong>
          <span>Socle enterprise</span>
        </div>
        <button type="button" onClick={logout}>
          Deconnexion
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
