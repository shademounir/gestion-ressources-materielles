import 'reflect-metadata';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const authenticatedRequest: AuthenticatedRequest = {
  user: {
    userId: 'user-1',
    email: 'user@grm.local',
    roles: [UserRole.USER],
  },
};

describe('NotificationsController', () => {
  it('delegates notification listing to NotificationsService', async () => {
    const response = {
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
    const listNotificationsMock = jest.fn().mockResolvedValue(response);
    const service = {
      listNotifications: listNotificationsMock,
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
    } as unknown as NotificationsService;
    const controller = new NotificationsController(service);
    const query: ListNotificationsQueryDto = {
      page: 1,
      limit: 20,
      read: false,
    };

    const result = await controller.findAll(query, authenticatedRequest);

    expect(listNotificationsMock).toHaveBeenCalledWith('user-1', query);
    expect(result).toEqual(response);
  });

  it('delegates unread count retrieval to NotificationsService', async () => {
    const response = { unreadCount: 2 };
    const getUnreadCountMock = jest.fn().mockResolvedValue(response);
    const service = {
      listNotifications: jest.fn(),
      getUnreadCount: getUnreadCountMock,
      markAsRead: jest.fn(),
    } as unknown as NotificationsService;
    const controller = new NotificationsController(service);

    const result = await controller.getUnreadCount(authenticatedRequest);

    expect(getUnreadCountMock).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(response);
  });

  it('delegates mark as read to NotificationsService', async () => {
    const response = {
      id: 'notification-1',
      recipientId: 'user-1',
      type: 'RESOURCE_ASSIGNED',
      title: 'Ressource affectee',
      message: 'Une ressource a ete affectee.',
      entityType: 'RESOURCE_ASSIGNMENT',
      entityId: 'assignment-1',
      readAt: '2026-06-04T09:20:00.000Z',
      createdAt: '2026-06-04T09:00:00.000Z',
      updatedAt: '2026-06-04T09:20:00.000Z',
    };
    const markAsReadMock = jest.fn().mockResolvedValue(response);
    const service = {
      listNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: markAsReadMock,
    } as unknown as NotificationsService;
    const controller = new NotificationsController(service);

    const result = await controller.markAsRead(
      'notification-1',
      authenticatedRequest,
    );

    expect(markAsReadMock).toHaveBeenCalledWith('notification-1', 'user-1');
    expect(result).toEqual(response);
  });
});
