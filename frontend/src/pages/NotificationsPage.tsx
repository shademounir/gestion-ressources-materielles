import { useCallback, useEffect, useState } from 'react';
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationAsRead,
  type NotificationItem,
  type NotificationListResponse,
} from '../modules/notifications/notificationsService';
import { useAuth } from '../modules/auth/useAuth';
import { getApiErrorMessage } from '../services/apiClient';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';
import { formatDate } from '../shared/utils/formatters';

const NOTIFICATIONS_PAGE_SIZE = 8;

type NotificationFilter = 'all' | 'unread' | 'read';

function getReadFilter(filter: NotificationFilter): boolean | undefined {
  if (filter === 'read') {
    return true;
  }

  if (filter === 'unread') {
    return false;
  }

  return undefined;
}

export function NotificationsPage() {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [meta, setMeta] = useState<NotificationListResponse['meta']>({
    page: 1,
    limit: NOTIFICATIONS_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [listResponse, countResponse] = await Promise.all([
        listNotifications(
          {
            page,
            limit: NOTIFICATIONS_PAGE_SIZE,
            read: getReadFilter(filter),
          },
          accessToken,
        ),
        getUnreadNotificationCount(accessToken),
      ]);
      setNotifications(listResponse.data);
      setMeta(listResponse.meta);
      setUnreadCount(countResponse.unreadCount);
    } catch (error) {
      setNotifications([]);
      setMeta({
        page: 1,
        limit: NOTIFICATIONS_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      });
      setErrorMessage(
        getApiErrorMessage(error, 'Impossible de charger les notifications.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filter, page]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  async function handleMarkAsRead(notificationId: string) {
    setMarkingNotificationId(notificationId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await markNotificationAsRead(notificationId, accessToken);
      setSuccessMessage('Notification marquee comme lue.');
      window.dispatchEvent(new Event('grm:notifications-updated'));
      await refreshNotifications();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Impossible de marquer la notification comme lue.'),
      );
    } finally {
      setMarkingNotificationId(null);
    }
  }

  return (
    <section className="notifications-page" aria-labelledby="notifications-title">
      <div className="resource-page-header">
        <div>
          <span className="dashboard-eyebrow">Notifications</span>
          <h1 id="notifications-title">Centre de notifications</h1>
          <p>Consultez les alertes applicatives liees a vos actions et aux evenements globaux.</p>
        </div>
        <span className="dashboard-status">{unreadCount} non lues</span>
      </div>

      <FeedbackMessage errorMessage={errorMessage} successMessage={successMessage} />

      <section className="notifications-panel" aria-labelledby="notifications-list-title">
        <div className="section-heading">
          <h2 id="notifications-list-title">Notifications recentes</h2>
          <p>Les notifications globales et personnelles sont triees par date de creation.</p>
        </div>

        <div className="notification-toolbar" role="group" aria-label="Filtre notifications">
          <button
            className={filter === 'all' ? 'filter-button active-filter' : 'filter-button'}
            type="button"
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
          >
            Toutes
          </button>
          <button
            className={filter === 'unread' ? 'filter-button active-filter' : 'filter-button'}
            type="button"
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
          >
            Non lues
          </button>
          <button
            className={filter === 'read' ? 'filter-button active-filter' : 'filter-button'}
            type="button"
            onClick={() => {
              setFilter('read');
              setPage(1);
            }}
          >
            Lues
          </button>
        </div>

        <div className="notification-list">
          {isLoading ? <p className="muted-copy">Chargement des notifications...</p> : null}
          {!isLoading && notifications.length === 0 ? (
            <div className="notification-empty-state">
              <strong>Aucune notification</strong>
              <p>Vous n'avez aucune notification pour ce filtre.</p>
            </div>
          ) : null}
          {!isLoading
            ? notifications.map((notification) => {
                const isRead = Boolean(notification.readAt);

                return (
                  <article
                    className={isRead ? 'notification-card' : 'notification-card notification-unread'}
                    key={notification.id}
                  >
                    <div>
                      <span className={isRead ? 'status-badge status-archived' : 'status-badge status-active'}>
                        {isRead ? 'Lue' : 'Non lue'}
                      </span>
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <span className="notification-meta">
                        {notification.entityType} - {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <button
                      className="secondary-action compact-action"
                      type="button"
                      disabled={isRead || markingNotificationId === notification.id}
                      onClick={() => void handleMarkAsRead(notification.id)}
                    >
                      {markingNotificationId === notification.id ? 'Lecture...' : 'Marquer comme lue'}
                    </button>
                  </article>
                );
              })
            : null}
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          >
            Precedent
          </button>
          <span>
            Page {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={page >= Math.max(meta.totalPages, 1) || isLoading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Suivant
          </button>
        </div>
      </section>
    </section>
  );
}
