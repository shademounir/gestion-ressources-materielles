import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/useAuth';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', enabled: true },
  { label: 'Ressources', path: '/resources', enabled: true },
  { label: 'Affectations', path: '/assignments', enabled: true },
  { label: 'Maintenance', path: '/dashboard', enabled: false },
  { label: 'Fournisseurs', path: '/dashboard', enabled: false },
  { label: "Appels d'offres", path: '/dashboard', enabled: false },
];

export function MainLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    void navigate('/login', { replace: true });
  }

  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur connecte';

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Barre laterale">
        <div className="sidebar-brand">
          <img src="/assets/logo-maroc-ynov-campus.png" alt="Maroc Ynov Campus" />
          <span>Gestion des Ressources Materielles</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navigationItems.map((item) =>
            item.enabled ? (
              <NavLink className="sidebar-link" key={item.label} to={item.path}>
                {item.label}
              </NavLink>
            ) : (
              <span className="sidebar-link sidebar-link-disabled" key={item.label}>
                {item.label}
              </span>
            ),
          )}
        </nav>
      </aside>

      <div className="app-content">
        <header className="app-header">
          <div>
            <strong>{userDisplayName}</strong>
            <span>{user?.role ?? 'Role applicatif'}</span>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Deconnexion
          </button>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
