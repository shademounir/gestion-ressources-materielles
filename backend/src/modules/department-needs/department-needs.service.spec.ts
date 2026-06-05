import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NeedPriority, NeedStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DepartmentNeedsService } from './department-needs.service';

type PrismaMock = {
  department: {
    findUnique: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
  };
  need: {
    count: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

describe('DepartmentNeedsService', () => {
  let service: DepartmentNeedsService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      department: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      need: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new DepartmentNeedsService(prisma as unknown as PrismaService);
  });

  it('lists department needs with filters and pagination', async () => {
    prisma.need.count.mockResolvedValue(1);
    prisma.need.findMany.mockResolvedValue([
      {
        id: 'need-1',
        title: 'Equipement salle informatique',
        justification: 'Renouveler le materiel de la salle informatique.',
        priority: NeedPriority.HIGH,
        status: NeedStatus.SUBMITTED,
        departmentId: 'department-1',
        createdById: 'user-1',
        createdAt: new Date('2026-06-02T10:00:00.000Z'),
        updatedAt: new Date('2026-06-02T10:00:00.000Z'),
      },
    ]);

    const result = await service.listDepartmentNeeds({
      page: 2,
      limit: 8,
      departmentId: 'department-1',
      priority: NeedPriority.HIGH,
      status: NeedStatus.SUBMITTED,
    });

    const expectedWhere = {
      departmentId: 'department-1',
      status: NeedStatus.SUBMITTED,
      priority: NeedPriority.HIGH,
    };

    expect(prisma.need.count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(prisma.need.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { createdAt: 'desc' },
      skip: 8,
      take: 8,
    });
    expect(result).toEqual({
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
        page: 2,
        limit: 8,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('creates a submitted department need with multiple items', async () => {
    prisma.department.findUnique.mockResolvedValue({
      id: 'department-1',
      deletedAt: null,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: null,
    });
    prisma.need.create.mockResolvedValue({
      id: 'need-1',
      title: 'Equipement salle informatique',
      justification: 'Renouveler le materiel de la salle informatique.',
      priority: NeedPriority.HIGH,
      status: NeedStatus.SUBMITTED,
      departmentId: 'department-1',
      createdById: 'user-1',
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
      updatedAt: new Date('2026-06-02T10:00:00.000Z'),
      items: [
        {
          id: 'item-1',
          needId: 'need-1',
          designation: 'PC portable',
          description: 'Pour salle informatique',
          quantity: 10,
          estimatedUnitPrice: 7500,
          createdAt: new Date('2026-06-02T10:00:00.000Z'),
          updatedAt: new Date('2026-06-02T10:00:00.000Z'),
        },
        {
          id: 'item-2',
          needId: 'need-1',
          designation: 'Ecran',
          description: null,
          quantity: 10,
          estimatedUnitPrice: null,
          createdAt: new Date('2026-06-02T10:00:00.000Z'),
          updatedAt: new Date('2026-06-02T10:00:00.000Z'),
        },
      ],
    });

    const result = await service.createDepartmentNeed(
      {
        title: ' Equipement salle informatique ',
        justification: ' Renouveler le materiel de la salle informatique. ',
        priority: NeedPriority.HIGH,
        departmentId: 'department-1',
        items: [
          {
            designation: ' PC portable ',
            description: ' Pour salle informatique ',
            quantity: 10,
            estimatedUnitPrice: 7500,
          },
          {
            designation: ' Ecran ',
            quantity: 10,
          },
        ],
      },
      'user-1',
    );

    expect(prisma.department.findUnique).toHaveBeenCalledWith({
      where: { id: 'department-1' },
      select: { id: true, deletedAt: true },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, deletedAt: true },
    });
    expect(prisma.need.create).toHaveBeenCalledWith({
      data: {
        title: 'Equipement salle informatique',
        justification: 'Renouveler le materiel de la salle informatique.',
        priority: NeedPriority.HIGH,
        status: NeedStatus.SUBMITTED,
        departmentId: 'department-1',
        createdById: 'user-1',
        items: {
          create: [
            {
              designation: 'PC portable',
              description: 'Pour salle informatique',
              quantity: 10,
              estimatedUnitPrice: 7500,
            },
            {
              designation: 'Ecran',
              description: null,
              quantity: 10,
              estimatedUnitPrice: null,
            },
          ],
        },
      },
      include: { items: true },
    });
    expect(result).toEqual({
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
          description: 'Pour salle informatique',
          quantity: 10,
          estimatedUnitPrice: 7500,
          createdAt: '2026-06-02T10:00:00.000Z',
        },
        {
          id: 'item-2',
          designation: 'Ecran',
          description: null,
          quantity: 10,
          estimatedUnitPrice: null,
          createdAt: '2026-06-02T10:00:00.000Z',
        },
      ],
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    });
  });

  it('rejects creation without need items', async () => {
    await expect(
      service.createDepartmentNeed(
        {
          title: 'Equipement salle informatique',
          justification: 'Renouveler le materiel de la salle informatique.',
          priority: NeedPriority.HIGH,
          departmentId: 'department-1',
          items: [],
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new BadRequestException('Au moins une ligne de besoin est obligatoire.'),
    );
    expect(prisma.department.findUnique).not.toHaveBeenCalled();
    expect(prisma.need.create).not.toHaveBeenCalled();
  });

  it('rejects creation when department does not exist', async () => {
    prisma.department.findUnique.mockResolvedValue(null);

    await expect(
      service.createDepartmentNeed(
        {
          title: 'Equipement salle informatique',
          justification: 'Renouveler le materiel de la salle informatique.',
          priority: NeedPriority.HIGH,
          departmentId: 'missing-department',
          items: [{ designation: 'PC portable', quantity: 10 }],
        },
        'user-1',
      ),
    ).rejects.toThrow(new NotFoundException('Departement introuvable.'));
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.need.create).not.toHaveBeenCalled();
  });

  it('rejects creation when creator user does not exist', async () => {
    prisma.department.findUnique.mockResolvedValue({
      id: 'department-1',
      deletedAt: null,
    });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.createDepartmentNeed(
        {
          title: 'Equipement salle informatique',
          justification: 'Renouveler le materiel de la salle informatique.',
          priority: NeedPriority.HIGH,
          departmentId: 'department-1',
          items: [{ designation: 'PC portable', quantity: 10 }],
        },
        'missing-user',
      ),
    ).rejects.toThrow(new NotFoundException('Utilisateur createur introuvable.'));
    expect(prisma.need.create).not.toHaveBeenCalled();
  });

  it('returns department need detail with department, requester and items', async () => {
    prisma.need.findUnique.mockResolvedValue({
      id: 'need-1',
      title: 'Equipement salle informatique',
      justification: 'Renouveler le materiel de la salle informatique.',
      priority: NeedPriority.HIGH,
      status: NeedStatus.SUBMITTED,
      departmentId: 'department-1',
      createdById: 'user-1',
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
      updatedAt: new Date('2026-06-02T10:00:00.000Z'),
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
      items: [
        {
          id: 'item-1',
          needId: 'need-1',
          designation: 'PC portable',
          description: 'Pour salle informatique',
          quantity: 10,
          estimatedUnitPrice: 7500,
          createdAt: new Date('2026-06-02T10:00:00.000Z'),
          updatedAt: new Date('2026-06-02T10:00:00.000Z'),
        },
      ],
    });

    const result = await service.getDepartmentNeedById('need-1');

    expect(prisma.need.findUnique).toHaveBeenCalledWith({
      where: { id: 'need-1' },
      include: {
        items: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
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
          description: 'Pour salle informatique',
          quantity: 10,
          estimatedUnitPrice: 7500,
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
    });
  });

  it('rejects department need detail retrieval when need does not exist', async () => {
    prisma.need.findUnique.mockResolvedValue(null);

    await expect(service.getDepartmentNeedById('need-unknown')).rejects.toThrow(
      new NotFoundException('Besoin introuvable.'),
    );
  });
});
