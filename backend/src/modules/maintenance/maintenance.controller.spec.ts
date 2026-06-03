import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { MaintenancePriority, MaintenanceTicketStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { MaintenanceTicketResponseDto } from './dto/maintenance-ticket-response.dto';
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

  it('rejects creation without authenticated user context', () => {
    const service = {
      reportFailure: jest.fn(),
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
});
