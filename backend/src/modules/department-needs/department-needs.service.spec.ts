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
        create: jest.fn(),
      },
    };

    service = new DepartmentNeedsService(prisma as unknown as PrismaService);
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
});
