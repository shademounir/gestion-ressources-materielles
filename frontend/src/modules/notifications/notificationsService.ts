import { apiClient } from '../../services/apiClient';

export const notificationTypes = [
  'RESOURCE_ASSIGNED',
  'RESOURCE_RETURNED',
  'MAINTENANCE_REPORTED',
  'MAINTENANCE_REPORT_CREATED',
  'MAINTENANCE_INTERVENTION_CREATED',
  'SUPPLIER_RETURN_CREATED',
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export interface NotificationItem {
  id: string;
  recipientId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListNotificationsParams {
  page: number;
  limit: number;
  read?: boolean;
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}

function buildQuery(params: ListNotificationsParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.read !== undefined) {
    searchParams.set('read', String(params.read));
  }

  return searchParams.toString();
}

export function listNotifications(
  params: ListNotificationsParams,
  accessToken: string | null,
): Promise<NotificationListResponse> {
  return apiClient<NotificationListResponse>(`/notifications?${buildQuery(params)}`, {
    accessToken,
  });
}

export function getUnreadNotificationCount(
  accessToken: string | null,
): Promise<NotificationUnreadCountResponse> {
  return apiClient<NotificationUnreadCountResponse>('/notifications/unread-count', {
    accessToken,
  });
}

export function markNotificationAsRead(
  notificationId: string,
  accessToken: string | null,
): Promise<NotificationItem> {
  return apiClient<NotificationItem>(`/notifications/${notificationId}/read`, {
    accessToken,
    method: 'PATCH',
  });
}
