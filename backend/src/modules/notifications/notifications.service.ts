import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Notification,
  NotificationEntityType,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
  NotificationUnreadCountResponseDto,
} from './dto/notification-response.dto';

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

  async listNotifications(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<NotificationListResponseDto> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const where = this.buildReadableNotificationWhere(userId, query.read);
    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: notifications.map((notification) =>
        this.toNotificationResponse(notification),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(
    userId: string,
  ): Promise<NotificationUnreadCountResponseDto> {
    const unreadCount = await this.prisma.notification.count({
      where: this.buildReadableNotificationWhere(userId, false),
    });

    return { unreadCount };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ recipientId: userId }, { recipientId: null }],
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable.');
    }

    if (notification.readAt) {
      return this.toNotificationResponse(notification);
    }

    const readNotification = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });

    return this.toNotificationResponse(readNotification);
  }

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

  private buildReadableNotificationWhere(
    userId: string,
    read?: boolean,
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = {
      OR: [{ recipientId: userId }, { recipientId: null }],
    };

    if (read === true) {
      where.readAt = { not: null };
    }

    if (read === false) {
      where.readAt = null;
    }

    return where;
  }

  private toNotificationResponse(
    notification: Notification,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      recipientId: notification.recipientId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      entityType: notification.entityType,
      entityId: notification.entityId,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };
  }
}
