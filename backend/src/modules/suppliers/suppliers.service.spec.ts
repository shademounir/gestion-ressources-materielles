import { ConflictException, NotFoundException } from '@nestjs/common';
import { SupplierStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SuppliersService } from './suppliers.service';

type PrismaMock = {
  supplier: {
    count: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      supplier: {
        count: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new SuppliersService(prisma as unknown as PrismaService);
  });

  it('lists suppliers with pagination, search and status filter', async () => {
    prisma.supplier.count.mockResolvedValue(1);
    prisma.supplier.findMany.mockResolvedValue([
      {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        address: 'Casablanca, Maroc',
        status: SupplierStatus.ACTIVE,
        createdAt: new Date('2026-06-02T11:00:00.000Z'),
        updatedAt: new Date('2026-06-02T11:00:00.000Z'),
      },
    ]);

    const result = await service.listSuppliers({
      page: 2,
      limit: 8,
      search: ' tech ',
      status: SupplierStatus.ACTIVE,
    });

    const expectedWhere = {
      status: SupplierStatus.ACTIVE,
      OR: [
        {
          name: {
            contains: 'tech',
            mode: 'insensitive',
          },
        },
        {
          contactEmail: {
            contains: 'tech',
            mode: 'insensitive',
          },
        },
      ],
    };

    expect(prisma.supplier.count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(prisma.supplier.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { createdAt: 'desc' },
      skip: 8,
      take: 8,
    });
    expect(result).toEqual({
      data: [
        {
          id: 'supplier-1',
          name: 'Tech Solutions Maroc',
          contactEmail: 'contact@techsolutions.test',
          phone: '+212 522 000 000',
          address: 'Casablanca, Maroc',
          status: SupplierStatus.ACTIVE,
          createdAt: '2026-06-02T11:00:00.000Z',
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

  it('creates an active supplier with normalized optional fields', async () => {
    prisma.supplier.findFirst.mockResolvedValue(null);
    prisma.supplier.create.mockResolvedValue({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: new Date('2026-06-02T11:00:00.000Z'),
      updatedAt: new Date('2026-06-02T11:00:00.000Z'),
    });

    const result = await service.createSupplier({
      name: ' Tech Solutions Maroc ',
      contactEmail: ' CONTACT@TechSolutions.Test ',
      phone: ' +212 522 000 000 ',
      address: ' Casablanca, Maroc ',
    });

    expect(prisma.supplier.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            name: {
              equals: 'Tech Solutions Maroc',
              mode: 'insensitive',
            },
          },
          {
            contactEmail: {
              equals: 'contact@techsolutions.test',
              mode: 'insensitive',
            },
          },
        ],
      },
      select: { id: true },
    });
    expect(prisma.supplier.create).toHaveBeenCalledWith({
      data: {
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        address: 'Casablanca, Maroc',
        status: SupplierStatus.ACTIVE,
      },
    });
    expect(result).toEqual({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: '2026-06-02T11:00:00.000Z',
    });
  });

  it('creates a supplier with null optional fields when omitted', async () => {
    prisma.supplier.findFirst.mockResolvedValue(null);
    prisma.supplier.create.mockResolvedValue({
      id: 'supplier-2',
      name: 'Office Market',
      contactEmail: null,
      phone: null,
      address: null,
      status: SupplierStatus.ACTIVE,
      createdAt: new Date('2026-06-02T11:10:00.000Z'),
      updatedAt: new Date('2026-06-02T11:10:00.000Z'),
    });

    const result = await service.createSupplier({
      name: 'Office Market',
    });

    expect(prisma.supplier.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            name: {
              equals: 'Office Market',
              mode: 'insensitive',
            },
          },
        ],
      },
      select: { id: true },
    });
    expect(prisma.supplier.create).toHaveBeenCalledWith({
      data: {
        name: 'Office Market',
        contactEmail: null,
        phone: null,
        address: null,
        status: SupplierStatus.ACTIVE,
      },
    });
    expect(result.contactEmail).toBeNull();
    expect(result.status).toBe(SupplierStatus.ACTIVE);
  });

  it('rejects duplicate supplier name or email', async () => {
    prisma.supplier.findFirst.mockResolvedValue({ id: 'supplier-1' });

    await expect(
      service.createSupplier({
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
      }),
    ).rejects.toThrow(
      new ConflictException('Un fournisseur avec ce nom ou cet email existe deja.'),
    );
    expect(prisma.supplier.create).not.toHaveBeenCalled();
  });

  it('returns supplier detail by id', async () => {
    prisma.supplier.findUnique.mockResolvedValue({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: new Date('2026-06-02T11:00:00.000Z'),
      updatedAt: new Date('2026-06-02T11:00:00.000Z'),
    });

    const result = await service.getSupplierById('supplier-1');

    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
    });
    expect(result).toEqual({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: '2026-06-02T11:00:00.000Z',
    });
  });

  it('rejects supplier detail retrieval when supplier does not exist', async () => {
    prisma.supplier.findUnique.mockResolvedValue(null);

    await expect(service.getSupplierById('supplier-unknown')).rejects.toThrow(
      new NotFoundException('Fournisseur introuvable.'),
    );
  });

  it('returns a structured supplier history with future relation placeholders', async () => {
    prisma.supplier.findUnique.mockResolvedValue({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: new Date('2026-06-02T11:00:00.000Z'),
      updatedAt: new Date('2026-06-02T11:30:00.000Z'),
    });

    const result = await service.getSupplierHistory('supplier-1');

    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
    });
    expect(result).toEqual({
      supplierIdentity: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        address: 'Casablanca, Maroc',
      },
      supplierStatus: SupplierStatus.ACTIVE,
      supplierCreatedAt: '2026-06-02T11:00:00.000Z',
      supplierUpdatedAt: '2026-06-02T11:30:00.000Z',
      offersCount: 0,
      tendersCount: 0,
      maintenanceReturnsCount: 0,
    });
  });

  it('rejects supplier history retrieval when supplier does not exist', async () => {
    prisma.supplier.findUnique.mockResolvedValue(null);

    await expect(service.getSupplierHistory('supplier-unknown')).rejects.toThrow(
      new NotFoundException('Fournisseur introuvable.'),
    );
  });

  it('deactivates an existing supplier without deleting it', async () => {
    prisma.supplier.findUnique.mockResolvedValue({ id: 'supplier-1' });
    prisma.supplier.update.mockResolvedValue({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.INACTIVE,
      createdAt: new Date('2026-06-02T11:00:00.000Z'),
      updatedAt: new Date('2026-06-02T12:00:00.000Z'),
    });

    const result = await service.deactivateSupplier('supplier-1');

    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
      select: { id: true },
    });
    expect(prisma.supplier.update).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
      data: { status: SupplierStatus.INACTIVE },
    });
    expect(result).toEqual({
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.INACTIVE,
      createdAt: '2026-06-02T11:00:00.000Z',
    });
  });

  it('rejects supplier deactivation when supplier does not exist', async () => {
    prisma.supplier.findUnique.mockResolvedValue(null);

    await expect(service.deactivateSupplier('supplier-unknown')).rejects.toThrow(
      new NotFoundException('Fournisseur introuvable.'),
    );
    expect(prisma.supplier.update).not.toHaveBeenCalled();
  });
});
