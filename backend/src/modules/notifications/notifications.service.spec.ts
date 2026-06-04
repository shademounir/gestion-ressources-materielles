import { NotificationEntityType, NotificationType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

type NotificationClientMock = {
  notification: {
    create: jest.Mock;
  };
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let client: NotificationClientMock;
  let writeClient: PrismaService;

  beforeEach(() => {
    client = {
      notification: {
        create: jest.fn().mockResolvedValue({ id: 'notification-1' }),
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
