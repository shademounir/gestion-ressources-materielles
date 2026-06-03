import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ResourcesPage } from '../pages/ResourcesPage';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:resourceId" element={<ResourcesPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/assignments/:assignmentId" element={<AssignmentsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
