import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, AuditEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

interface CreateAuditLogInput {
  userId?: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  details?: Prisma.InputJsonValue | null;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createAuditLog(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId ?? null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          details: input.details ?? Prisma.DbNull,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Audit log creation skipped for ${input.action} on ${input.entityType}:${input.entityId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async logUserCreated(
    createdUserId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.USER_CREATED,
      entityType: AuditEntityType.USER,
      entityId: createdUserId,
      details: { createdUserId },
    });
  }

  async logUserRoleUpdated(
    updatedUserId: string,
    role: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.USER_ROLE_UPDATED,
      entityType: AuditEntityType.USER,
      entityId: updatedUserId,
      details: { role },
    });
  }

  async logUserDeactivated(
    deactivatedUserId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.USER_DEACTIVATED,
      entityType: AuditEntityType.USER,
      entityId: deactivatedUserId,
      details: { status: 'INACTIVE' },
    });
  }

  async logResourceCreated(
    resourceId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.RESOURCE_CREATED,
      entityType: AuditEntityType.RESOURCE,
      entityId: resourceId,
      details: { resourceId },
    });
  }

  async logResourceStatusUpdated(
    resourceId: string,
    status: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.RESOURCE_STATUS_UPDATED,
      entityType: AuditEntityType.RESOURCE,
      entityId: resourceId,
      details: { status },
    });
  }

  async logResourceAssigned(
    assignmentId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.RESOURCE_ASSIGNED,
      entityType: AuditEntityType.RESOURCE_ASSIGNMENT,
      entityId: assignmentId,
      details: { assignmentId },
    });
  }

  async logResourceReturned(
    assignmentId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.RESOURCE_RETURNED,
      entityType: AuditEntityType.RESOURCE_ASSIGNMENT,
      entityId: assignmentId,
      details: { assignmentId },
    });
  }

  async logMaintenanceReported(
    ticketId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.MAINTENANCE_REPORTED,
      entityType: AuditEntityType.MAINTENANCE_TICKET,
      entityId: ticketId,
      details: { ticketId },
    });
  }

  async logMaintenanceReportCreated(
    reportId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.MAINTENANCE_REPORT_CREATED,
      entityType: AuditEntityType.MAINTENANCE_REPORT,
      entityId: reportId,
      details: { reportId },
    });
  }

  async logMaintenanceInterventionCreated(
    interventionId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.MAINTENANCE_INTERVENTION_CREATED,
      entityType: AuditEntityType.MAINTENANCE_INTERVENTION,
      entityId: interventionId,
      details: { interventionId },
    });
  }

  async logSupplierReturnCreated(
    supplierReturnId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.createAuditLog({
      userId: actorUserId,
      action: AuditAction.SUPPLIER_RETURN_CREATED,
      entityType: AuditEntityType.SUPPLIER_RETURN,
      entityId: supplierReturnId,
      details: { supplierReturnId },
    });
  }
}
