import { NotFoundException } from '@nestjs/common';
import {
  Notification,
  NotificationEntityType,
  NotificationType,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

type NotificationClientMock = {
  notification: {
    count: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
};

const notification = {
  id: 'notification-1',
  recipientId: 'user-1',
  type: NotificationType.RESOURCE_ASSIGNED,
  title: 'Ressource affectee',
  message: 'Une ressource materielle a ete affectee a un utilisateur.',
  entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
  entityId: 'assignment-1',
  readAt: null,
  createdAt: new Date('2026-06-04T09:00:00.000Z'),
  updatedAt: new Date('2026-06-04T09:00:00.000Z'),
} satisfies Notification;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let client: NotificationClientMock;
  let writeClient: PrismaService;

  beforeEach(() => {
    client = {
      notification: {
        count: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'notification-1' }),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    writeClient = client as unknown as PrismaService;
    service = new NotificationsService(client as unknown as PrismaService);
  });

  it('creates a generic system notification', async () => {
    await service.createSystemNotification({
      recipientId: 'user-1',
      type: NotificationType.RESOURCE_ASSIGNED,
      title: 'Ressource affectee',
      message: 'Une ressource materielle a ete affectee a un utilisateur.',
      entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
      entityId: 'assignment-1',
    });

    expect(client.notification.create).toHaveBeenCalledWith({
      data: {
        recipientId: 'user-1',
        type: NotificationType.RESOURCE_ASSIGNED,
        title: 'Ressource affectee',
        message: 'Une ressource materielle a ete affectee a un utilisateur.',
        entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
        entityId: 'assignment-1',
      },
    });
  });

  it('lists user and global notifications with unread filtering', async () => {
    client.notification.count.mockResolvedValue(1);
    client.notification.findMany.mockResolvedValue([notification]);

    const result = await service.listNotifications('user-1', {
      page: 2,
      limit: 10,
      read: false,
    });

    const expectedWhere = {
      OR: [{ recipientId: 'user-1' }, { recipientId: null }],
      readAt: null,
    };
    expect(client.notification.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
    expect(client.notification.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(result).toEqual({
      data: [
        {
          id: 'notification-1',
          recipientId: 'user-1',
          type: NotificationType.RESOURCE_ASSIGNED,
          title: 'Ressource affectee',
          message:
            'Une ressource materielle a ete affectee a un utilisateur.',
          entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
          entityId: 'assignment-1',
          readAt: null,
          createdAt: '2026-06-04T09:00:00.000Z',
          updatedAt: '2026-06-04T09:00:00.000Z',
        },
      ],
      meta: {
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('lists read notifications visible to the user', async () => {
    const readAt = new Date('2026-06-04T09:20:00.000Z');
    client.notification.count.mockResolvedValue(1);
    client.notification.findMany.mockResolvedValue([
      {
        ...notification,
        recipientId: null,
        readAt,
        updatedAt: readAt,
      },
    ]);

    const result = await service.listNotifications('user-1', {
      page: 0,
      limit: 250,
      read: true,
    });

    expect(client.notification.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ recipientId: 'user-1' }, { recipientId: null }],
        readAt: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 100,
    });
    expect(result.data[0]).toMatchObject({
      recipientId: null,
      readAt: '2026-06-04T09:20:00.000Z',
    });
    expect(result.meta).toEqual({
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
    });
  });

  it('counts unread notifications visible to the user', async () => {
    client.notification.count.mockResolvedValue(3);

    const result = await service.getUnreadCount('user-1');

    expect(client.notification.count).toHaveBeenCalledWith({
      where: {
        OR: [{ recipientId: 'user-1' }, { recipientId: null }],
        readAt: null,
      },
    });
    expect(result).toEqual({ unreadCount: 3 });
  });

  it('marks a private or global notification as read', async () => {
    const readAt = new Date('2026-06-04T09:20:00.000Z');
    client.notification.findFirst.mockResolvedValue(notification);
    client.notification.update.mockResolvedValue({
      ...notification,
      readAt,
      updatedAt: readAt,
    });

    const result = await service.markAsRead('notification-1', 'user-1');

    expect(client.notification.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'notification-1',
        OR: [{ recipientId: 'user-1' }, { recipientId: null }],
      },
    });
    expect(client.notification.update).toHaveBeenCalledWith({
      where: { id: 'notification-1' },
      data: { readAt: expect.any(Date) as Date },
    });
    expect(result.readAt).toBe('2026-06-04T09:20:00.000Z');
  });

  it('marks a global notification as read when it is visible to the user', async () => {
    const readAt = new Date('2026-06-04T09:20:00.000Z');
    client.notification.findFirst.mockResolvedValue({
      ...notification,
      recipientId: null,
    });
    client.notification.update.mockResolvedValue({
      ...notification,
      recipientId: null,
      readAt,
      updatedAt: readAt,
    });

    const result = await service.markAsRead('notification-global', 'user-1');

    expect(client.notification.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'notification-global',
        OR: [{ recipientId: 'user-1' }, { recipientId: null }],
      },
    });
    expect(client.notification.update).toHaveBeenCalledWith({
      where: { id: 'notification-1' },
      data: { readAt: expect.any(Date) as Date },
    });
    expect(result.recipientId).toBeNull();
    expect(result.readAt).toBe('2026-06-04T09:20:00.000Z');
  });

  it('keeps mark as read idempotent when already read', async () => {
    const readNotification = {
      ...notification,
      readAt: new Date('2026-06-04T09:20:00.000Z'),
    };
    client.notification.findFirst.mockResolvedValue(readNotification);

    const result = await service.markAsRead('notification-1', 'user-1');

    expect(client.notification.update).not.toHaveBeenCalled();
    expect(result.readAt).toBe('2026-06-04T09:20:00.000Z');
  });

  it('rejects mark as read for inaccessible notifications', async () => {
    client.notification.findFirst.mockResolvedValue(null);

    await expect(
      service.markAsRead('notification-unknown', 'user-1'),
    ).rejects.toThrow(new NotFoundException('Notification introuvable.'));
    expect(client.notification.update).not.toHaveBeenCalled();
  });

  it('creates resource assignment notifications', async () => {
    await service.notifyResourceAssigned(writeClient, 'assignment-1', 'user-1');
    await service.notifyResourceReturned(writeClient, 'assignment-1', 'user-1');

    expect(client.notification.create).toHaveBeenNthCalledWith(1, {
      data: {
        recipientId: 'user-1',
        type: NotificationType.RESOURCE_ASSIGNED,
        title: 'Ressource affectee',
        message: 'Une ressource materielle a ete affectee a un utilisateur.',
        entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
        entityId: 'assignment-1',
      },
    });
    expect(client.notification.create).toHaveBeenNthCalledWith(2, {
      data: {
        recipientId: 'user-1',
        type: NotificationType.RESOURCE_RETURNED,
        title: 'Ressource retournee',
        message: 'Une ressource affectee a ete retournee.',
        entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
        entityId: 'assignment-1',
      },
    });
  });

  it('creates maintenance ticket and report notifications', async () => {
    await service.notifyMaintenanceReported(writeClient, 'ticket-1', 'user-1');
    await service.notifyMaintenanceReportCreated(writeClient, 'report-1', 'user-1');

    expect(client.notification.create).toHaveBeenNthCalledWith(1, {
      data: {
        recipientId: 'user-1',
        type: NotificationType.MAINTENANCE_REPORTED,
        title: 'Panne signalee',
        message: 'Un ticket de maintenance a ete ouvert pour une ressource.',
        entityType: NotificationEntityType.MAINTENANCE_TICKET,
        entityId: 'ticket-1',
      },
    });
    expect(client.notification.create).toHaveBeenNthCalledWith(2, {
      data: {
        recipientId: 'user-1',
        type: NotificationType.MAINTENANCE_REPORT_CREATED,
        title: 'Constat de maintenance cree',
        message: 'Un constat de maintenance a ete cree pour un ticket.',
        entityType: NotificationEntityType.MAINTENANCE_REPORT,
        entityId: 'report-1',
      },
    });
  });

  it('creates global maintenance operation notifications', async () => {
    await service.notifyMaintenanceInterventionCreated(writeClient, 'intervention-1');
    await service.notifySupplierReturnCreated(writeClient, 'supplier-return-1');

    expect(client.notification.create).toHaveBeenNthCalledWith(1, {
      data: {
        recipientId: null,
        type: NotificationType.MAINTENANCE_INTERVENTION_CREATED,
        title: 'Intervention de maintenance creee',
        message: 'Une intervention de maintenance a ete enregistree.',
        entityType: NotificationEntityType.MAINTENANCE_INTERVENTION,
        entityId: 'intervention-1',
      },
    });
    expect(client.notification.create).toHaveBeenNthCalledWith(2, {
      data: {
        recipientId: null,
        type: NotificationType.SUPPLIER_RETURN_CREATED,
        title: 'Retour fournisseur cree',
        message: 'Un retour fournisseur a ete declare pour une ressource.',
        entityType: NotificationEntityType.SUPPLIER_RETURN,
        entityId: 'supplier-return-1',
      },
    });
  });
});
