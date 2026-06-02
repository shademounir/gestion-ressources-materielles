import { ConflictException } from '@nestjs/common';
import { SupplierStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SuppliersService } from './suppliers.service';

type PrismaMock = {
  supplier: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      supplier: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new SuppliersService(prisma as unknown as PrismaService);
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
});
