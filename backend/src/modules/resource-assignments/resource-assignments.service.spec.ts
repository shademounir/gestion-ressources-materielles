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
import { NotificationsService } from '../notifications/notifications.service';
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
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

type PrismaMock = {
  $transaction: jest.Mock;
  resource: {
    findUnique: jest.Mock;
  };
  resourceAssignment: {
    count: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
};

type NotificationsServiceMock = {
  notifyResourceAssigned: jest.Mock;
  notifyResourceReturned: jest.Mock;
};

describe('ResourceAssignmentsService', () => {
  let service: ResourceAssignmentsService;
  let prisma: PrismaMock;
  let tx: TransactionMock;
  let notificationsService: NotificationsServiceMock;

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
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn((callback: (client: TransactionMock) => unknown) =>
        callback(tx),
      ),
      resource: {
        findUnique: jest.fn(),
      },
      resourceAssignment: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    notificationsService = {
      notifyResourceAssigned: jest.fn(),
      notifyResourceReturned: jest.fn(),
    };
    service = new ResourceAssignmentsService(
      prisma as unknown as PrismaService,
      notificationsService as unknown as NotificationsService,
    );
  });

  it('lists assignment history for an existing resource', async () => {
    prisma.resource.findUnique.mockResolvedValue({ id: 'resource-1' });
    prisma.resourceAssignment.count.mockResolvedValue(1);
    prisma.resourceAssignment.findMany.mockResolvedValue([
      {
        id: 'assignment-1',
        resourceId: 'resource-1',
        userId: 'user-1',
        assignedAt: new Date('2026-06-03T09:00:00.000Z'),
        returnedAt: null,
        status: ResourceAssignmentStatus.ACTIVE,
        comment: 'Affectation initiale',
        returnComment: null,
        createdAt: new Date('2026-06-03T09:00:00.000Z'),
        updatedAt: new Date('2026-06-03T09:00:00.000Z'),
        resource: {
          id: 'resource-1',
          inventoryCode: 'INV-INFO-2026-0001',
          name: 'Ordinateur portable Dell Latitude 5440',
          category: 'Informatique',
          status: ResourceStatus.ASSIGNED,
        },
        user: {
          id: 'user-1',
          firstName: 'Amina',
          lastName: 'Bennani',
          email: 'amina.bennani@faculty.test',
        },
      },
    ]);

    const result = await service.listResourceAssignmentsByResource(
      'resource-1',
      { page: 2, limit: 10 },
    );

    expect(prisma.resource.findUnique).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      select: { id: true },
    });
    expect(prisma.resourceAssignment.count).toHaveBeenCalledWith({
      where: { resourceId: 'resource-1' },
    });
    expect(prisma.resourceAssignment.findMany).toHaveBeenCalledWith({
      where: { resourceId: 'resource-1' },
      include: {
        resource: {
          select: {
            id: true,
            inventoryCode: true,
            name: true,
            category: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(result).toEqual({
      data: [
        {
          id: 'assignment-1',
          resourceId: 'resource-1',
          resourceName: 'Ordinateur portable Dell Latitude 5440',
          inventoryCode: 'INV-INFO-2026-0001',
          userId: 'user-1',
          userFullName: 'Amina Bennani',
          status: ResourceAssignmentStatus.ACTIVE,
          assignedAt: '2026-06-03T09:00:00.000Z',
          returnedAt: null,
          comment: 'Affectation initiale',
          returnComment: null,
        },
      ],
      meta: {
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('normalizes assignment history pagination', async () => {
    prisma.resource.findUnique.mockResolvedValue({ id: 'resource-1' });
    prisma.resourceAssignment.count.mockResolvedValue(0);
    prisma.resourceAssignment.findMany.mockResolvedValue([]);

    const result = await service.listResourceAssignmentsByResource(
      'resource-1',
      { page: 0, limit: 250 },
    );

    expect(prisma.resourceAssignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 100,
      }),
    );
    expect(result.meta).toEqual({
      page: 1,
      limit: 100,
      total: 0,
      totalPages: 0,
    });
  });

  it('rejects assignment history when resource does not exist', async () => {
    prisma.resource.findUnique.mockResolvedValue(null);

    await expect(
      service.listResourceAssignmentsByResource('resource-unknown', {}),
    ).rejects.toThrow(new NotFoundException('Ressource introuvable.'));
    expect(prisma.resourceAssignment.count).not.toHaveBeenCalled();
    expect(prisma.resourceAssignment.findMany).not.toHaveBeenCalled();
  });

  it('returns assignment detail with resource and user projections', async () => {
    prisma.resourceAssignment.findUnique.mockResolvedValue({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: new Date('2026-06-03T09:00:00.000Z'),
      returnedAt: new Date('2026-06-03T10:00:00.000Z'),
      status: ResourceAssignmentStatus.RETURNED,
      comment: 'Affectation initiale',
      returnComment: 'Retour confirme',
      createdAt: new Date('2026-06-03T09:00:00.000Z'),
      updatedAt: new Date('2026-06-03T10:00:00.000Z'),
      resource: {
        id: 'resource-1',
        inventoryCode: 'INV-INFO-2026-0001',
        name: 'Ordinateur portable Dell Latitude 5440',
        category: 'Informatique',
        status: ResourceStatus.AVAILABLE,
      },
      user: {
        id: 'user-1',
        firstName: 'Amina',
        lastName: 'Bennani',
        email: 'amina.bennani@faculty.test',
      },
    });

    const result = await service.getAssignmentById('assignment-1');

    expect(prisma.resourceAssignment.findUnique).toHaveBeenCalledWith({
      where: { id: 'assignment-1' },
      include: {
        resource: {
          select: {
            id: true,
            inventoryCode: true,
            name: true,
            category: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    expect(result).toEqual({
      id: 'assignment-1',
      status: ResourceAssignmentStatus.RETURNED,
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: '2026-06-03T10:00:00.000Z',
      comment: 'Affectation initiale',
      returnComment: 'Retour confirme',
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T10:00:00.000Z',
      resource: {
        id: 'resource-1',
        inventoryCode: 'INV-INFO-2026-0001',
        name: 'Ordinateur portable Dell Latitude 5440',
        category: 'Informatique',
        status: ResourceStatus.AVAILABLE,
      },
      user: {
        id: 'user-1',
        firstName: 'Amina',
        lastName: 'Bennani',
        email: 'amina.bennani@faculty.test',
      },
    });
  });

  it('rejects detail when assignment does not exist', async () => {
    prisma.resourceAssignment.findUnique.mockResolvedValue(null);

    await expect(
      service.getAssignmentById('assignment-unknown'),
    ).rejects.toThrow(new NotFoundException('Affectation introuvable.'));
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
      returnComment: null,
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
    expect(notificationsService.notifyResourceAssigned).toHaveBeenCalledWith(
      tx,
      'assignment-1',
      'user-1',
    );
    expect(result).toEqual({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: null,
      status: ResourceAssignmentStatus.ACTIVE,
      comment: 'Affectation pour le laboratoire informatique',
      returnComment: null,
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T09:00:00.000Z',
    });
  });

  it('returns an active assignment and makes the resource available in a transaction', async () => {
    tx.resourceAssignment.findUnique.mockResolvedValue({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: new Date('2026-06-03T09:00:00.000Z'),
      returnedAt: null,
      status: ResourceAssignmentStatus.ACTIVE,
      comment: 'Affectation initiale',
      returnComment: null,
      createdAt: new Date('2026-06-03T09:00:00.000Z'),
      updatedAt: new Date('2026-06-03T09:00:00.000Z'),
      resource: {
        id: 'resource-1',
        status: ResourceStatus.ASSIGNED,
      },
    });
    tx.resourceAssignment.update.mockResolvedValue({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: new Date('2026-06-03T09:00:00.000Z'),
      returnedAt: new Date('2026-06-03T10:00:00.000Z'),
      status: ResourceAssignmentStatus.RETURNED,
      comment: 'Affectation initiale',
      returnComment: 'Ressource retournee en bon etat',
      createdAt: new Date('2026-06-03T09:00:00.000Z'),
      updatedAt: new Date('2026-06-03T10:00:00.000Z'),
    });
    tx.resource.update.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });

    const result = await service.returnResource('assignment-1', {
      returnComment: ' Ressource retournee en bon etat ',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.resourceAssignment.findUnique).toHaveBeenCalledWith({
      where: { id: 'assignment-1' },
      include: {
        resource: {
          select: { id: true, status: true },
        },
      },
    });
    expect(tx.resourceAssignment.update).toHaveBeenCalledWith({
      where: { id: 'assignment-1' },
      data: {
        status: ResourceAssignmentStatus.RETURNED,
        returnedAt: expect.any(Date) as Date,
        returnComment: 'Ressource retournee en bon etat',
      },
    });
    expect(tx.resource.update).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      data: { status: ResourceStatus.AVAILABLE },
    });
    expect(notificationsService.notifyResourceReturned).toHaveBeenCalledWith(
      tx,
      'assignment-1',
      'user-1',
    );
    expect(result).toEqual({
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: '2026-06-03T10:00:00.000Z',
      status: ResourceAssignmentStatus.RETURNED,
      comment: 'Affectation initiale',
      returnComment: 'Ressource retournee en bon etat',
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T10:00:00.000Z',
    });
  });

  it('rejects return when assignment does not exist', async () => {
    tx.resourceAssignment.findUnique.mockResolvedValue(null);

    await expect(
      service.returnResource('assignment-unknown', {}),
    ).rejects.toThrow(new NotFoundException('Affectation introuvable.'));
    expect(tx.resourceAssignment.update).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });

  it.each([
    ResourceAssignmentStatus.RETURNED,
    ResourceAssignmentStatus.CANCELLED,
  ])('rejects return when assignment status is %s', async (status) => {
    tx.resourceAssignment.findUnique.mockResolvedValue({
      id: 'assignment-1',
      resourceId: 'resource-1',
      status,
      resource: {
        id: 'resource-1',
        status: ResourceStatus.ASSIGNED,
      },
    });

    await expect(service.returnResource('assignment-1', {})).rejects.toThrow(
      new BadRequestException('Seule une affectation active peut etre retournee.'),
    );
    expect(tx.resourceAssignment.update).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });

  it('rejects return when linked resource is no longer assigned', async () => {
    tx.resourceAssignment.findUnique.mockResolvedValue({
      id: 'assignment-1',
      resourceId: 'resource-1',
      status: ResourceAssignmentStatus.ACTIVE,
      resource: {
        id: 'resource-1',
        status: ResourceStatus.AVAILABLE,
      },
    });

    await expect(service.returnResource('assignment-1', {})).rejects.toThrow(
      new BadRequestException('Seule une ressource affectee peut etre retournee.'),
    );
    expect(tx.resourceAssignment.update).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
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
