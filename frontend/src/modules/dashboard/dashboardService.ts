import { getActiveAssignmentCount } from '../assignments/assignmentsService';
import { getOpenMaintenanceTicketCount } from '../maintenance/maintenanceService';
import { getUnreadNotificationCount } from '../notifications/notificationsService';
import { listResources, type ResourceListResponse } from '../resources/resourcesService';

export interface DashboardKpi {
  label: string;
  value: string;
  trend: string;
  isFallback?: boolean;
}

export interface DashboardMetrics {
  kpis: DashboardKpi[];
  hasPartialError: boolean;
}

async function safeMetric<TValue>(
  loader: () => Promise<TValue>,
  fallback: TValue,
): Promise<{ value: TValue; hasError: boolean }> {
  try {
    return {
      value: await loader(),
      hasError: false,
    };
  } catch {
    return {
      value: fallback,
      hasError: true,
    };
  }
}

function resolveTotal(response: ResourceListResponse): number {
  return response.meta?.total ?? response.data.length;
}

export async function getDashboardMetrics(
  accessToken: string | null,
): Promise<DashboardMetrics> {
  const [
    totalResources,
    availableResources,
    unreadNotifications,
    activeAssignments,
    openMaintenanceTickets,
  ] = await Promise.all([
    safeMetric(
      async () =>
        resolveTotal(
          await listResources(
            {
              page: 1,
              limit: 1,
            },
            accessToken,
          ),
        ),
      0,
    ),
    safeMetric(
      async () =>
        resolveTotal(
          await listResources(
            {
              page: 1,
              limit: 1,
              status: 'AVAILABLE',
            },
            accessToken,
          ),
        ),
      0,
    ),
    safeMetric(
      async () => (await getUnreadNotificationCount(accessToken)).unreadCount,
      0,
    ),
    safeMetric(
      async () => (await getActiveAssignmentCount(accessToken)).count,
      0,
    ),
    safeMetric(
      async () => (await getOpenMaintenanceTicketCount(accessToken)).count,
      0,
    ),
  ]);

  return {
    hasPartialError:
      totalResources.hasError ||
      availableResources.hasError ||
      unreadNotifications.hasError ||
      activeAssignments.hasError ||
      openMaintenanceTickets.hasError,
    kpis: [
      {
        label: 'Ressources totales',
        value: String(totalResources.value),
        trend: totalResources.hasError ? 'Erreur de chargement' : 'Inventaire consolide',
      },
      {
        label: 'Ressources disponibles',
        value: String(availableResources.value),
        trend: availableResources.hasError ? 'Erreur de chargement' : 'Pretes a affecter',
      },
      {
        label: 'Notifications non lues',
        value: String(unreadNotifications.value),
        trend: unreadNotifications.hasError ? 'Erreur de chargement' : 'A traiter',
      },
      {
        label: 'Affectations actives',
        value: String(activeAssignments.value),
        trend: activeAssignments.hasError ? 'Erreur de chargement' : 'En cours',
      },
      {
        label: 'Tickets maintenance ouverts',
        value: String(openMaintenanceTickets.value),
        trend: openMaintenanceTickets.hasError ? 'Erreur de chargement' : 'A suivre',
      },
    ],
  };
}
