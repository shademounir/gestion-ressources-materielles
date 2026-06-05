import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ResourcesPage } from '../pages/ResourcesPage';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { TendersPage } from '../pages/TendersPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

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
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/suppliers"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SuppliersPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/suppliers/:supplierId"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SuppliersPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/tenders"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <TendersPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/tenders/:tenderId"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <TendersPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </RoleProtectedRoute>
          }
        />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
