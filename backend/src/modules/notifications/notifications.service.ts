import { Injectable } from '@nestjs/common';
import {
  NotificationEntityType,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type NotificationWriteClient = Prisma.TransactionClient | PrismaService;

interface CreateSystemNotificationInput {
  recipientId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSystemNotification(
    input: CreateSystemNotificationInput,
    client: NotificationWriteClient = this.prisma,
  ): Promise<void> {
    await client.notification.create({
      data: {
        recipientId: input.recipientId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });
  }

  async notifyResourceAssigned(
    client: NotificationWriteClient,
    assignmentId: string,
    recipientId: string,
  ): Promise<void> {
    await this.createSystemNotification(
      {
        recipientId,
        type: NotificationType.RESOURCE_ASSIGNED,
        title: 'Ressource affectee',
        message: 'Une ressource materielle a ete affectee a un utilisateur.',
        entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
        entityId: assignmentId,
      },
      client,
    );
  }

  async notifyResourceReturned(
    client: NotificationWriteClient,
    assignmentId: string,
    recipientId: string,
  ): Promise<void> {
    await this.createSystemNotification(
      {
        recipientId,
        type: NotificationType.RESOURCE_RETURNED,
        title: 'Ressource retournee',
        message: 'Une ressource affectee a ete retournee.',
        entityType: NotificationEntityType.RESOURCE_ASSIGNMENT,
        entityId: assignmentId,
      },
      client,
    );
  }

  async notifyMaintenanceReported(
    client: NotificationWriteClient,
    ticketId: string,
    recipientId: string,
  ): Promise<void> {
    await this.createSystemNotification(
      {
        recipientId,
        type: NotificationType.MAINTENANCE_REPORTED,
        title: 'Panne signalee',
        message: 'Un ticket de maintenance a ete ouvert pour une ressource.',
        entityType: NotificationEntityType.MAINTENANCE_TICKET,
        entityId: ticketId,
      },
      client,
    );
  }

  async notifyMaintenanceReportCreated(
    client: NotificationWriteClient,
    reportId: string,
    recipientId: string,
  ): Promise<void> {
    await this.createSystemNotification(
      {
        recipientId,
        type: NotificationType.MAINTENANCE_REPORT_CREATED,
        title: 'Constat de maintenance cree',
        message: 'Un constat de maintenance a ete cree pour un ticket.',
        entityType: NotificationEntityType.MAINTENANCE_REPORT,
        entityId: reportId,
      },
      client,
    );
  }

  async notifyMaintenanceInterventionCreated(
    client: NotificationWriteClient,
    interventionId: string,
  ): Promise<void> {
    await this.createSystemNotification(
      {
        type: NotificationType.MAINTENANCE_INTERVENTION_CREATED,
        title: 'Intervention de maintenance creee',
        message: 'Une intervention de maintenance a ete enregistree.',
        entityType: NotificationEntityType.MAINTENANCE_INTERVENTION,
        entityId: interventionId,
      },
      client,
    );
  }

  async notifySupplierReturnCreated(
    client: NotificationWriteClient,
    supplierReturnId: string,
  ): Promise<void> {
    await this.createSystemNotification(
      {
        type: NotificationType.SUPPLIER_RETURN_CREATED,
        title: 'Retour fournisseur cree',
        message: 'Un retour fournisseur a ete declare pour une ressource.',
        entityType: NotificationEntityType.SUPPLIER_RETURN,
        entityId: supplierReturnId,
      },
      client,
    );
  }
}
