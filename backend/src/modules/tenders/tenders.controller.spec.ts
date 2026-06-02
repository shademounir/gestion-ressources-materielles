import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { TenderStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { TenderResponseDto } from './dto/tender-response.dto';
import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';

describe('TendersController', () => {
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
