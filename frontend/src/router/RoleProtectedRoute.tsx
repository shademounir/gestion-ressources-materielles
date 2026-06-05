import { Navigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/useAuth';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
