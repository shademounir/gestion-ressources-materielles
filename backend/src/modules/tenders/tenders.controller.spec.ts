import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { TenderStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ListTendersQueryDto } from './dto/list-tenders-query.dto';
import { TenderDetailResponseDto } from './dto/tender-detail-response.dto';
import { TenderListResponseDto } from './dto/tender-list-response.dto';
import { TenderResponseDto } from './dto/tender-response.dto';
import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';

describe('TendersController', () => {
  it('delegates tender listing to TendersService', async () => {
    const tenderList: TenderListResponseDto = {
      data: [
        {
          id: 'tender-1',
          reference: 'AO-20260602-0001',
          title: 'Appel d offres - Equipement salle informatique',
          status: TenderStatus.PUBLISHED,
          deadline: '2026-07-15T12:00:00.000Z',
          publishedAt: '2026-06-02T13:00:00.000Z',
          awardedAt: null,
          needId: 'need-1',
          createdById: 'user-1',
          createdAt: '2026-06-02T12:00:00.000Z',
          updatedAt: '2026-06-02T13:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 8,
        total: 1,
        totalPages: 1,
      },
    };
    const query: ListTendersQueryDto = {
      page: 1,
      limit: 8,
      search: 'AO-20260602',
      status: TenderStatus.PUBLISHED,
    };
    const listTendersMock = jest.fn().mockResolvedValue(tenderList);
    const tendersService = {
      listTenders: listTendersMock,
    } as unknown as TendersService;
    const controller = new TendersController(tendersService);

    const result = await controller.list(query);

    expect(listTendersMock).toHaveBeenCalledWith(query);
    expect(result).toEqual(tenderList);
  });

  it('requires ADMIN or MANAGER role on the list endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TendersController.prototype,
      'list',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected list handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates tender creation to TendersService with authenticated user', async () => {
    const tenderResponse: TenderResponseDto = {
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.DRAFT,
      deadline: '2026-07-15T12:00:00.000Z',
      publishedAt: null,
      awardedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T12:00:00.000Z',
    };
    const createTenderMock = jest.fn().mockResolvedValue(tenderResponse);
    const tendersService = {
      createTender: createTenderMock,
    } as unknown as TendersService;
    const controller = new TendersController(tendersService);
    const dto = {
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      deadline: '2026-07-15T12:00:00.000Z',
      needId: 'need-1',
    };

    const result = await controller.create(dto, {
      user: {
        userId: 'user-1',
        email: 'manager@faculty.test',
        roles: [UserRole.MANAGER],
      },
    });

    expect(createTenderMock).toHaveBeenCalledWith(dto, 'user-1');
    expect(result).toEqual(tenderResponse);
  });

  it('requires ADMIN or MANAGER role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TendersController.prototype,
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
    const tendersService = {
      createTender: jest.fn(),
    } as unknown as TendersService;
    const controller = new TendersController(tendersService);

    expect(() =>
      controller.create(
        {
          title: 'Appel d offres - Equipement salle informatique',
          description: 'Acquisition de postes informatiques pour la salle A12.',
          deadline: '2026-07-15T12:00:00.000Z',
          needId: 'need-1',
        },
        {},
      ),
    ).toThrow(new UnauthorizedException('Utilisateur non authentifie.'));
  });

  it('delegates tender detail retrieval to TendersService', async () => {
    const tenderDetail: TenderDetailResponseDto = {
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.PUBLISHED,
      deadline: '2026-07-15T12:00:00.000Z',
      publishedAt: '2026-06-02T13:00:00.000Z',
      awardedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T13:00:00.000Z',
      need: {
        id: 'need-1',
        title: 'Equipement salle informatique',
        priority: 'HIGH',
        status: 'SUBMITTED',
        departmentId: 'department-1',
        createdById: 'user-1',
        createdAt: '2026-06-02T10:00:00.000Z',
      },
      createdBy: {
        id: 'user-1',
        firstName: 'Demo',
        lastName: 'Manager',
        email: 'manager@grm.local',
      },
      offers: [],
    };
    const getTenderByIdMock = jest.fn().mockResolvedValue(tenderDetail);
    const tendersService = {
      getTenderById: getTenderByIdMock,
    } as unknown as TendersService;
    const controller = new TendersController(tendersService);

    const result = await controller.getById('tender-1');

    expect(getTenderByIdMock).toHaveBeenCalledWith('tender-1');
    expect(result).toEqual(tenderDetail);
  });

  it('requires ADMIN or MANAGER role on the detail endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TendersController.prototype,
      'getById',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected getById handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates tender publication to TendersService', async () => {
    const tenderResponse: TenderResponseDto = {
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.PUBLISHED,
      deadline: '2026-07-15T12:00:00.000Z',
      publishedAt: '2026-06-02T13:00:00.000Z',
      awardedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T13:00:00.000Z',
    };
    const publishTenderMock = jest.fn().mockResolvedValue(tenderResponse);
    const tendersService = {
      publishTender: publishTenderMock,
    } as unknown as TendersService;
    const controller = new TendersController(tendersService);

    const result = await controller.publish('tender-1');

    expect(publishTenderMock).toHaveBeenCalledWith('tender-1');
    expect(result).toEqual(tenderResponse);
  });

  it('requires ADMIN or MANAGER role on the publish endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TendersController.prototype,
      'publish',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected publish handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
