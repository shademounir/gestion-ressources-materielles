import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import {
  MaintenancePriority,
  MaintenanceSeverity,
  MaintenanceTicketStatus,
  ResourceStatus,
  SupplierReturnStatus,
  SupplierStatus,
} from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { MaintenanceInterventionResponseDto } from './dto/maintenance-intervention-response.dto';
import { MaintenanceReportResponseDto } from './dto/maintenance-report-response.dto';
import { MaintenanceTicketResponseDto } from './dto/maintenance-ticket-response.dto';
import { SupplierReturnResponseDto } from './dto/supplier-return-response.dto';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

describe('MaintenanceController', () => {
  it('delegates failure reporting to MaintenanceService with authenticated user', async () => {
    const response: MaintenanceTicketResponseDto = {
      id: 'ticket-1',
      resourceId: 'resource-1',
      reportedById: 'user-1',
      description: 'Le poste ne demarre plus.',
      priority: MaintenancePriority.HIGH,
      status: MaintenanceTicketStatus.OPEN,
      openedAt: '2026-06-03T09:00:00.000Z',
      closedAt: null,
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T09:00:00.000Z',
    };
    const reportFailureMock = jest.fn().mockResolvedValue(response);
    const service = {
      reportFailure: reportFailureMock,
      createMaintenanceIntervention: jest.fn(),
      createMaintenanceReport: jest.fn(),
      createSupplierReturn: jest.fn(),
    } as unknown as MaintenanceService;
    const controller = new MaintenanceController(service);
    const dto = {
      resourceId: 'resource-1',
      description: 'Le poste ne demarre plus.',
      priority: MaintenancePriority.HIGH,
    };

    const result = await controller.create(dto, {
      user: {
        userId: 'user-1',
        email: 'manager@faculty.test',
        roles: [UserRole.MANAGER],
      },
    });

    expect(reportFailureMock).toHaveBeenCalledWith(dto, 'user-1');
    expect(result).toEqual(response);
  });

  it('delegates maintenance report creation to MaintenanceService with authenticated user', async () => {
    const response: MaintenanceReportResponseDto = {
      id: 'report-1',
      diagnosis: 'Carte mere defectueuse apres test de demarrage.',
      probableCause: 'Surtension probable au niveau de l alimentation.',
      severity: MaintenanceSeverity.HIGH,
      recommendations: 'Remplacer la carte mere.',
      reportedAt: '2026-06-03T11:00:00.000Z',
      author: {
        id: 'user-1',
        firstName: 'Amina',
        lastName: 'Bennani',
        email: 'amina.bennani@faculty.test',
      },
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.OPEN,
        priority: MaintenancePriority.HIGH,
        openedAt: '2026-06-03T09:00:00.000Z',
      },
    };
    const createMaintenanceReportMock = jest.fn().mockResolvedValue(response);
    const service = {
      reportFailure: jest.fn(),
      createMaintenanceIntervention: jest.fn(),
      createMaintenanceReport: createMaintenanceReportMock,
      createSupplierReturn: jest.fn(),
    } as unknown as MaintenanceService;
    const controller = new MaintenanceController(service);
    const dto = {
      diagnosis: 'Carte mere defectueuse apres test de demarrage.',
      probableCause: 'Surtension probable au niveau de l alimentation.',
      severity: MaintenanceSeverity.HIGH,
      recommendations: 'Remplacer la carte mere.',
    };

    const result = await controller.createReport('ticket-1', dto, {
      user: {
        userId: 'user-1',
        email: 'manager@faculty.test',
        roles: [UserRole.MANAGER],
      },
    });

    expect(createMaintenanceReportMock).toHaveBeenCalledWith(
      'ticket-1',
      dto,
      'user-1',
    );
    expect(result).toEqual(response);
  });

  it('delegates maintenance intervention creation to MaintenanceService', async () => {
    const response: MaintenanceInterventionResponseDto = {
      id: 'intervention-1',
      maintenanceTicketId: 'ticket-1',
      technicianName: 'Technicien maintenance interne',
      description: 'Remplacement du bloc alimentation.',
      startedAt: '2026-06-03T13:00:00.000Z',
      completedAt: null,
      cost: null,
      result: null,
      createdAt: '2026-06-03T13:00:00.000Z',
      updatedAt: '2026-06-03T13:00:00.000Z',
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.IN_PROGRESS,
        priority: MaintenancePriority.HIGH,
        openedAt: '2026-06-03T09:00:00.000Z',
      },
    };
    const createMaintenanceInterventionMock = jest
      .fn()
      .mockResolvedValue(response);
    const service = {
      reportFailure: jest.fn(),
      createMaintenanceIntervention: createMaintenanceInterventionMock,
      createMaintenanceReport: jest.fn(),
      createSupplierReturn: jest.fn(),
    } as unknown as MaintenanceService;
    const controller = new MaintenanceController(service);
    const dto = {
      technicianName: 'Technicien maintenance interne',
      description: 'Remplacement du bloc alimentation.',
      startedAt: '2026-06-03T13:00:00.000Z',
    };

    const result = await controller.createIntervention('ticket-1', dto);

    expect(createMaintenanceInterventionMock).toHaveBeenCalledWith(
      'ticket-1',
      dto,
    );
    expect(result).toEqual(response);
  });

  it('delegates supplier return creation to MaintenanceService', async () => {
    const response: SupplierReturnResponseDto = {
      id: 'supplier-return-1',
      maintenanceTicketId: 'ticket-1',
      resourceId: 'resource-1',
      supplierId: 'supplier-1',
      reason: 'Diagnostic confirme une panne sous garantie.',
      sentAt: '2026-06-03T14:00:00.000Z',
      expectedReturnAt: '2026-06-17T14:00:00.000Z',
      actualReturnAt: null,
      status: SupplierReturnStatus.SENT_TO_SUPPLIER,
      comment: 'Retour envoye avec bon de prise en charge.',
      createdAt: '2026-06-03T14:00:00.000Z',
      updatedAt: '2026-06-03T14:00:00.000Z',
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.IN_PROGRESS,
        priority: MaintenancePriority.HIGH,
        openedAt: '2026-06-03T09:00:00.000Z',
      },
      resource: {
        id: 'resource-1',
        inventoryCode: 'INV-INFO-2026-0001',
        name: 'Ordinateur portable Dell Latitude 5440',
        status: ResourceStatus.UNDER_MAINTENANCE,
      },
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        status: SupplierStatus.ACTIVE,
      },
    };
    const createSupplierReturnMock = jest.fn().mockResolvedValue(response);
    const service = {
      reportFailure: jest.fn(),
      createMaintenanceIntervention: jest.fn(),
      createMaintenanceReport: jest.fn(),
      createSupplierReturn: createSupplierReturnMock,
    } as unknown as MaintenanceService;
    const controller = new MaintenanceController(service);
    const dto = {
      supplierId: 'supplier-1',
      reason: 'Diagnostic confirme une panne sous garantie.',
      sentAt: '2026-06-03T14:00:00.000Z',
      expectedReturnAt: '2026-06-17T14:00:00.000Z',
      comment: 'Retour envoye avec bon de prise en charge.',
    };

    const result = await controller.createSupplierReturn('ticket-1', dto);

    expect(createSupplierReturnMock).toHaveBeenCalledWith('ticket-1', dto);
    expect(result).toEqual(response);
  });

  it('requires ADMIN or MANAGER role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      MaintenanceController.prototype,
      'create',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected create handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('requires ADMIN or MANAGER role on the report endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      MaintenanceController.prototype,
      'createReport',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected createReport handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('requires ADMIN or MANAGER role on the intervention endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      MaintenanceController.prototype,
      'createIntervention',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected createIntervention handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('requires ADMIN or MANAGER role on the supplier return endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      MaintenanceController.prototype,
      'createSupplierReturn',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected createSupplierReturn handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('rejects creation without authenticated user context', () => {
    const service = {
      reportFailure: jest.fn(),
      createMaintenanceIntervention: jest.fn(),
      createMaintenanceReport: jest.fn(),
      createSupplierReturn: jest.fn(),
    } as unknown as MaintenanceService;
    const controller = new MaintenanceController(service);

    expect(() =>
      controller.create(
        {
          resourceId: 'resource-1',
          description: 'Le poste ne demarre plus.',
          priority: MaintenancePriority.HIGH,
        },
        {},
      ),
    ).toThrow(new UnauthorizedException('Utilisateur non authentifie.'));
  });

  it('rejects report creation without authenticated user context', () => {
    const service = {
      reportFailure: jest.fn(),
      createMaintenanceIntervention: jest.fn(),
      createMaintenanceReport: jest.fn(),
      createSupplierReturn: jest.fn(),
    } as unknown as MaintenanceService;
    const controller = new MaintenanceController(service);

    expect(() =>
      controller.createReport(
        'ticket-1',
        {
          diagnosis: 'Diagnostic technique.',
          probableCause: 'Cause probable.',
          severity: MaintenanceSeverity.MEDIUM,
        },
        {},
      ),
    ).toThrow(new UnauthorizedException('Utilisateur non authentifie.'));
  });
});
