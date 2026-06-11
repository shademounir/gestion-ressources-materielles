import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { NeedPriority, NeedStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { DepartmentNeedsController } from './department-needs.controller';
import { DepartmentNeedsService } from './department-needs.service';
import {
  DepartmentNeedDetailResponseDto,
  DepartmentNeedListResponseDto,
} from './dto/department-need-read-response.dto';
import { DepartmentNeedResponseDto } from './dto/department-need-response.dto';
import { ListDepartmentNeedsQueryDto } from './dto/list-department-needs-query.dto';

describe('DepartmentNeedsController', () => {
  it('delegates department need listing to DepartmentNeedsService', async () => {
    const response: DepartmentNeedListResponseDto = {
      data: [
        {
          id: 'need-1',
          title: 'Equipement salle informatique',
          priority: NeedPriority.HIGH,
          status: NeedStatus.SUBMITTED,
          departmentId: 'department-1',
          createdById: 'user-1',
          createdAt: '2026-06-02T10:00:00.000Z',
          updatedAt: '2026-06-02T10:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 8,
        total: 1,
        totalPages: 1,
      },
    };
    const query: ListDepartmentNeedsQueryDto = {
      page: 1,
      limit: 8,
      departmentId: 'department-1',
      priority: NeedPriority.HIGH,
      status: NeedStatus.SUBMITTED,
    };
    const listMock = jest.fn().mockResolvedValue(response);
    const service = {
      listDepartmentNeeds: listMock,
    } as unknown as DepartmentNeedsService;
    const controller = new DepartmentNeedsController(service);

    const result = await controller.list(query);

    expect(listMock).toHaveBeenCalledWith(query);
    expect(result).toEqual(response);
  });

  it('requires ADMIN or MANAGER role on the list endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      DepartmentNeedsController.prototype,
      'list',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected list handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates need creation to DepartmentNeedsService with authenticated user', async () => {
    const response: DepartmentNeedResponseDto = {
      id: 'need-1',
      title: 'Equipement salle informatique',
      justification: 'Renouveler le materiel de la salle informatique.',
      priority: NeedPriority.HIGH,
      status: NeedStatus.SUBMITTED,
      departmentId: 'department-1',
      createdById: 'user-1',
      items: [
        {
          id: 'item-1',
          designation: 'PC portable',
          description: null,
          quantity: 10,
          estimatedUnitPrice: null,
          createdAt: '2026-06-02T10:00:00.000Z',
        },
      ],
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    };
    const createMock = jest.fn().mockResolvedValue(response);
    const service = {
      createDepartmentNeed: createMock,
    } as unknown as DepartmentNeedsService;
    const controller = new DepartmentNeedsController(service);
    const dto = {
      title: 'Equipement salle informatique',
      justification: 'Renouveler le materiel de la salle informatique.',
      priority: NeedPriority.HIGH,
      departmentId: 'department-1',
      items: [{ designation: 'PC portable', quantity: 10 }],
    };

    const result = await controller.create(dto, {
      user: {
        userId: 'user-1',
        email: 'manager@faculty.test',
        roles: [UserRole.MANAGER],
      },
    });

    expect(createMock).toHaveBeenCalledWith(dto, 'user-1');
    expect(result).toEqual(response);
  });

  it('requires ADMIN or MANAGER role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      DepartmentNeedsController.prototype,
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
      createDepartmentNeed: jest.fn(),
    } as unknown as DepartmentNeedsService;
    const controller = new DepartmentNeedsController(service);

    expect(() =>
      controller.create(
        {
          title: 'Equipement salle informatique',
          justification: 'Renouveler le materiel de la salle informatique.',
          priority: NeedPriority.HIGH,
          departmentId: 'department-1',
          items: [{ designation: 'PC portable', quantity: 10 }],
        },
        {},
      ),
    ).toThrow(new UnauthorizedException('Utilisateur non authentifie.'));
  });

  it('delegates department need detail retrieval to DepartmentNeedsService', async () => {
    const response: DepartmentNeedDetailResponseDto = {
      id: 'need-1',
      title: 'Equipement salle informatique',
      justification: 'Renouveler le materiel de la salle informatique.',
      priority: NeedPriority.HIGH,
      status: NeedStatus.SUBMITTED,
      departmentId: 'department-1',
      createdById: 'user-1',
      items: [
        {
          id: 'item-1',
          designation: 'PC portable',
          description: null,
          quantity: 10,
          estimatedUnitPrice: null,
          createdAt: '2026-06-02T10:00:00.000Z',
        },
      ],
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
      department: {
        id: 'department-1',
        name: 'Informatique',
      },
      createdBy: {
        id: 'user-1',
        firstName: 'Demo',
        lastName: 'Manager',
        email: 'manager@grm.local',
      },
    };
    const detailMock = jest.fn().mockResolvedValue(response);
    const service = {
      getDepartmentNeedById: detailMock,
    } as unknown as DepartmentNeedsService;
    const controller = new DepartmentNeedsController(service);

    const result = await controller.getById('need-1');

    expect(detailMock).toHaveBeenCalledWith('need-1');
    expect(result).toEqual(response);
  });

  it('requires ADMIN or MANAGER role on the detail endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      DepartmentNeedsController.prototype,
      'getById',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected getById handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
