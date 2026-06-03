import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  ResourceAssignmentStatus,
  ResourceStatus,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ResourceAssignmentsService } from './resource-assignments.service';

type TransactionMock = {
  resource: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
  };
  resourceAssignment: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

type PrismaMock = {
  $transaction: jest.Mock;
};

describe('ResourceAssignmentsService', () => {
  let service: ResourceAssignmentsService;
  let prisma: PrismaMock;
  let tx: TransactionMock;

  beforeEach(() => {
    tx = {
      resource: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      resourceAssignment: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn((callback: (client: TransactionMock) => unknown) =>
        callback(tx),
      ),
    };
    service = new ResourceAssignmentsService(prisma as unknown as PrismaService);
  });

  it('assigns an available resource to an active user in a transaction', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });
    tx.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.ACTIVE,
      deletedAt: null,
    });
    tx.resourceAssignment.findFirst.mockResolvedValue(null);
    tx.resourceAssignment.create.mockResolvedValue({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: new Date('2026-06-03T09:00:00.000Z'),
      returnedAt: null,
      status: ResourceAssignmentStatus.ACTIVE,
      comment: 'Affectation pour le laboratoire informatique',
      createdAt: new Date('2026-06-03T09:00:00.000Z'),
      updatedAt: new Date('2026-06-03T09:00:00.000Z'),
    });
    tx.resource.update.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.ASSIGNED,
    });

    const result = await service.assignResource({
      resourceId: 'resource-1',
      userId: 'user-1',
      comment: ' Affectation pour le laboratoire informatique ',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.resource.findUnique).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      select: { id: true, status: true },
    });
    expect(tx.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, status: true, deletedAt: true },
    });
    expect(tx.resourceAssignment.findFirst).toHaveBeenCalledWith({
      where: {
        resourceId: 'resource-1',
        status: ResourceAssignmentStatus.ACTIVE,
      },
      select: { id: true },
    });
    expect(tx.resourceAssignment.create).toHaveBeenCalledWith({
      data: {
        resourceId: 'resource-1',
        userId: 'user-1',
        status: ResourceAssignmentStatus.ACTIVE,
        comment: 'Affectation pour le laboratoire informatique',
      },
    });
    expect(tx.resource.update).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      data: { status: ResourceStatus.ASSIGNED },
    });
    expect(result).toEqual({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: null,
      status: ResourceAssignmentStatus.ACTIVE,
      comment: 'Affectation pour le laboratoire informatique',
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T09:00:00.000Z',
    });
  });

  it('rejects assignment when resource does not exist', async () => {
    tx.resource.findUnique.mockResolvedValue(null);

    await expect(
      service.assignResource({
        resourceId: 'resource-unknown',
        userId: 'user-1',
      }),
    ).rejects.toThrow(new NotFoundException('Ressource introuvable.'));
    expect(tx.resourceAssignment.create).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });

  it.each([
    ResourceStatus.ASSIGNED,
    ResourceStatus.UNDER_MAINTENANCE,
    ResourceStatus.OUT_OF_SERVICE,
    ResourceStatus.ARCHIVED,
  ])('rejects assignment when resource status is %s', async (status) => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status,
    });

    await expect(
      service.assignResource({
        resourceId: 'resource-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(
      new BadRequestException('Seule une ressource disponible peut etre affectee.'),
    );
    expect(tx.user.findUnique).not.toHaveBeenCalled();
    expect(tx.resourceAssignment.create).not.toHaveBeenCalled();
  });

  it('rejects assignment when user does not exist', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });
    tx.user.findUnique.mockResolvedValue(null);

    await expect(
      service.assignResource({
        resourceId: 'resource-1',
        userId: 'user-unknown',
      }),
    ).rejects.toThrow(new NotFoundException('Utilisateur introuvable.'));
    expect(tx.resourceAssignment.create).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });

  it('rejects assignment when user is inactive', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });
    tx.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.INACTIVE,
      deletedAt: null,
    });

    await expect(
      service.assignResource({
        resourceId: 'resource-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Un utilisateur inactif ne peut pas recevoir une affectation.',
      ),
    );
    expect(tx.resourceAssignment.create).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });

  it('rejects assignment when an active assignment already exists', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });
    tx.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.ACTIVE,
      deletedAt: null,
    });
    tx.resourceAssignment.findFirst.mockResolvedValue({
      id: 'assignment-existing',
    });

    await expect(
      service.assignResource({
        resourceId: 'resource-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(
      new ConflictException('Cette ressource possede deja une affectation active.'),
    );
    expect(tx.resourceAssignment.create).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });
});
