import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../modules/auth/useAuth';
import { getUnreadNotificationCount } from '../modules/notifications/notificationsService';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', enabled: true },
  { label: 'Ressources', path: '/resources', enabled: true },
  { label: 'Affectations', path: '/assignments', enabled: true },
  { label: 'Maintenance', path: '/maintenance', enabled: true },
  { label: 'Notifications', path: '/notifications', enabled: true },
  { label: 'Administration', path: '/admin/users', enabled: true, allowedRoles: ['ADMIN'] },
  { label: 'Fournisseurs', path: '/suppliers', enabled: true, allowedRoles: ['ADMIN', 'MANAGER'] },
  { label: "Appels d'offres", path: '/dashboard', enabled: false },
];

export function MainLayout() {
  const { accessToken, logout, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken) {
      setUnreadCount(null);
      return;
    }

    try {
      const response = await getUnreadNotificationCount(accessToken);
      setUnreadCount(response.unreadCount);
    } catch {
      setUnreadCount(null);
    }
  }, [accessToken]);

  useEffect(() => {
    function handleNotificationsUpdated() {
      void refreshUnreadCount();
    }

    void refreshUnreadCount();
    window.addEventListener('grm:notifications-updated', handleNotificationsUpdated);

    return () => {
      window.removeEventListener('grm:notifications-updated', handleNotificationsUpdated);
    };
  }, [refreshUnreadCount]);

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
          {navigationItems.map((item) => {
            if (item.allowedRoles && (!user || !item.allowedRoles.includes(user.role))) {
              return null;
            }

            return item.enabled ? (
              <NavLink className="sidebar-link" key={item.label} to={item.path}>
                <span>{item.label}</span>
                {item.path === '/notifications' && unreadCount ? (
                  <span className="sidebar-badge" aria-label={`${unreadCount} notifications non lues`}>
                    {unreadCount}
                  </span>
                ) : null}
              </NavLink>
            ) : (
              <span className="sidebar-link sidebar-link-disabled" key={item.label}>
                {item.label}
              </span>
            );
          })}
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
