import { Logger } from '@nestjs/common';
import { AuditAction, AuditEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditLogsService } from './audit-logs.service';

type AuditLogClientMock = {
  auditLog: {
    create: jest.Mock;
  };
};

type AuditLogCreateArgs = {
  data: {
    userId: string | null;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    details?: unknown;
  };
};

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let client: AuditLogClientMock;

  beforeEach(() => {
    client = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    service = new AuditLogsService(client as unknown as PrismaService);
  });

  it('creates a generic audit log entry', async () => {
    await service.createAuditLog({
      userId: 'admin-1',
      action: AuditAction.RESOURCE_CREATED,
      entityType: AuditEntityType.RESOURCE,
      entityId: 'resource-1',
      details: { inventoryCode: 'INV-INFO-2026-0001' },
    });

    expect(client.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'admin-1',
        action: AuditAction.RESOURCE_CREATED,
        entityType: AuditEntityType.RESOURCE,
        entityId: 'resource-1',
        details: { inventoryCode: 'INV-INFO-2026-0001' },
      },
    });
  });

  it('persists audit entries without an actor using Prisma null JSON details', async () => {
    await service.createAuditLog({
      action: AuditAction.MAINTENANCE_REPORTED,
      entityType: AuditEntityType.MAINTENANCE_TICKET,
      entityId: 'ticket-1',
    });

    expect(client.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: null,
        action: AuditAction.MAINTENANCE_REPORTED,
        entityType: AuditEntityType.MAINTENANCE_TICKET,
        entityId: 'ticket-1',
        details: Prisma.DbNull,
      },
    });
  });

  it('does not throw when audit persistence fails', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    client.auditLog.create.mockRejectedValueOnce(new Error('database unavailable'));

    await expect(
      service.createAuditLog({
        action: AuditAction.USER_CREATED,
        entityType: AuditEntityType.USER,
        entityId: 'user-1',
      }),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      'Audit log creation skipped for USER_CREATED on USER:user-1',
      expect.any(String),
    );
    warnSpy.mockRestore();
  });

  it('creates action-specific audit log entries', async () => {
    await service.logUserCreated('user-created', 'admin-1');
    await service.logUserRoleUpdated('user-updated', 'MANAGER', 'admin-1');
    await service.logUserDeactivated('user-disabled', 'admin-1');
    await service.logResourceCreated('resource-1', 'admin-1');
    await service.logResourceStatusUpdated(
      'resource-1',
      'UNDER_MAINTENANCE',
      'admin-1',
    );
    await service.logResourceAssigned('assignment-1', 'manager-1');
    await service.logResourceReturned('assignment-1', 'manager-1');
    await service.logMaintenanceReported('ticket-1', 'manager-1');
    await service.logMaintenanceReportCreated('report-1', 'manager-1');
    await service.logMaintenanceInterventionCreated('intervention-1', 'manager-1');
    await service.logSupplierReturnCreated('supplier-return-1', 'manager-1');

    expect(client.auditLog.create).toHaveBeenCalledTimes(11);
    const firstCall = client.auditLog.create.mock.calls[0]?.[0] as
      | AuditLogCreateArgs
      | undefined;
    const sixthCall = client.auditLog.create.mock.calls[5]?.[0] as
      | AuditLogCreateArgs
      | undefined;
    const lastCall = client.auditLog.create.mock.calls[10]?.[0] as
      | AuditLogCreateArgs
      | undefined;

    expect(firstCall?.data).toMatchObject({
      userId: 'admin-1',
      action: AuditAction.USER_CREATED,
      entityType: AuditEntityType.USER,
      entityId: 'user-created',
    });
    expect(sixthCall?.data).toMatchObject({
      userId: 'manager-1',
      action: AuditAction.RESOURCE_ASSIGNED,
      entityType: AuditEntityType.RESOURCE_ASSIGNMENT,
      entityId: 'assignment-1',
    });
    expect(lastCall?.data).toMatchObject({
      userId: 'manager-1',
      action: AuditAction.SUPPLIER_RETURN_CREATED,
      entityType: AuditEntityType.SUPPLIER_RETURN,
      entityId: 'supplier-return-1',
    });
  });
});
