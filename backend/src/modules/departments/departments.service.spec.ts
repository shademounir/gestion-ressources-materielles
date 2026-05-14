import { ConflictException } from '@nestjs/common';
import { DepartmentStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DepartmentsService } from './departments.service';

type PrismaMock = {
  department: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      department: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new DepartmentsService(prisma as unknown as PrismaService);
  });

  it('creates an active department with a unique name', async () => {
    prisma.department.findFirst.mockResolvedValue(null);
    prisma.department.create.mockResolvedValue({
      id: 'department-1',
      name: 'Informatique',
      description: 'Departement des sciences informatiques',
      status: DepartmentStatus.ACTIVE,
      createdAt: new Date('2026-05-14T09:30:00.000Z'),
      updatedAt: new Date('2026-05-14T09:30:00.000Z'),
      deletedAt: null,
    });

    const result = await service.createDepartment({
      name: ' Informatique ',
      description: ' Departement des sciences informatiques ',
    });

    expect(prisma.department.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          equals: 'Informatique',
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });
    expect(prisma.department.create).toHaveBeenCalledWith({
      data: {
        name: 'Informatique',
        description: 'Departement des sciences informatiques',
        status: DepartmentStatus.ACTIVE,
      },
    });
    expect(result).toEqual({
      id: 'department-1',
      name: 'Informatique',
      description: 'Departement des sciences informatiques',
      status: DepartmentStatus.ACTIVE,
      createdAt: '2026-05-14T09:30:00.000Z',
    });
  });

  it('creates a department with a null description when omitted', async () => {
    prisma.department.findFirst.mockResolvedValue(null);
    prisma.department.create.mockResolvedValue({
      id: 'department-2',
      name: 'Mathematiques',
      description: null,
      status: DepartmentStatus.ACTIVE,
      createdAt: new Date('2026-05-14T09:45:00.000Z'),
      updatedAt: new Date('2026-05-14T09:45:00.000Z'),
      deletedAt: null,
    });

    const result = await service.createDepartment({
      name: 'Mathematiques',
    });

    expect(prisma.department.create).toHaveBeenCalledWith({
      data: {
        name: 'Mathematiques',
        description: null,
        status: DepartmentStatus.ACTIVE,
      },
    });
    expect(result.description).toBeNull();
    expect(result.status).toBe(DepartmentStatus.ACTIVE);
  });

  it('rejects duplicate department names', async () => {
    prisma.department.findFirst.mockResolvedValue({ id: 'department-1' });

    await expect(
      service.createDepartment({
        name: 'Informatique',
      }),
    ).rejects.toThrow(new ConflictException('Un departement avec ce nom existe deja.'));
    expect(prisma.department.create).not.toHaveBeenCalled();
  });
});
