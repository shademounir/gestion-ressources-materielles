import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, ResourceStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ResourceCreatedAtSort } from './dto/list-resources-query.dto';
import { ResourcesService } from './resources.service';

type PrismaMock = {
  resource: {
    count: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
  };
  supplier: {
    findUnique: jest.Mock;
  };
};

type ResourceCreateMockArgs = {
  data: {
    name: string;
    inventoryCode: string;
    category: string;
    description: string | null;
    serialNumber: string | null;
    acquisitionDate: Date | null;
    acquisitionValue: Prisma.Decimal | null;
    status: ResourceStatus;
    supplierId: string | null;
  };
};

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      resource: {
        count: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      supplier: {
        findUnique: jest.fn(),
      },
    };
    service = new ResourcesService(prisma as unknown as PrismaService);
  });

  it('creates an available resource with normalized fields and supplier link', async () => {
    prisma.resource.findUnique.mockResolvedValue(null);
    prisma.supplier.findUnique.mockResolvedValue({ id: 'supplier-1' });
    prisma.resource.create.mockImplementation((args: ResourceCreateMockArgs) => ({
      id: 'resource-1',
      ...args.data,
      createdAt: new Date('2026-06-02T16:00:00.000Z'),
      updatedAt: new Date('2026-06-02T16:00:00.000Z'),
    }));

    const result = await service.createResource({
      name: ' Ordinateur portable Dell Latitude 5440 ',
      inventoryCode: ' INV-INFO-2026-0001 ',
      category: ' Informatique ',
      description: ' PC portable destine aux salles informatiques ',
      serialNumber: ' SN-DL-5440-2026-001 ',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: 12500,
      supplierId: 'supplier-1',
    });

    expect(prisma.resource.findUnique).toHaveBeenCalledWith({
      where: { inventoryCode: 'INV-INFO-2026-0001' },
      select: { id: true },
    });
    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
      select: { id: true },
    });
    expect(prisma.resource.create).toHaveBeenCalledWith({
      data: {
        name: 'Ordinateur portable Dell Latitude 5440',
        inventoryCode: 'INV-INFO-2026-0001',
        category: 'Informatique',
        description: 'PC portable destine aux salles informatiques',
        serialNumber: 'SN-DL-5440-2026-001',
        acquisitionDate: new Date('2026-06-02T00:00:00.000Z'),
        acquisitionValue: new Prisma.Decimal(12500),
        status: ResourceStatus.AVAILABLE,
        supplierId: 'supplier-1',
      },
    });
    expect(result).toEqual({
      id: 'resource-1',
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: '12500',
      status: ResourceStatus.AVAILABLE,
      supplierId: 'supplier-1',
      createdAt: '2026-06-02T16:00:00.000Z',
    });
  });

  it('lists resources with secure pagination, filters and createdAt sorting', async () => {
    prisma.resource.count.mockResolvedValue(1);
    prisma.resource.findMany.mockResolvedValue([
      {
        id: 'resource-1',
        inventoryCode: 'INV-INFO-2026-0001',
        name: 'Ordinateur portable Dell Latitude 5440',
        category: 'Informatique',
        status: ResourceStatus.AVAILABLE,
        supplierId: 'supplier-1',
        createdAt: new Date('2026-06-02T16:00:00.000Z'),
      },
    ]);

    const result = await service.listResources({
      page: 2,
      limit: 10,
      name: ' Latitude ',
      inventoryCode: ' INV-INFO ',
      category: ' Informatique ',
      status: ResourceStatus.AVAILABLE,
      createdAtSort: ResourceCreatedAtSort.ASC,
    });

    const expectedWhere = {
      name: {
        contains: 'Latitude',
        mode: 'insensitive',
      },
      inventoryCode: {
        contains: 'INV-INFO',
        mode: 'insensitive',
      },
      status: ResourceStatus.AVAILABLE,
      category: {
        equals: 'Informatique',
        mode: 'insensitive',
      },
    };
    expect(prisma.resource.count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(prisma.resource.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { createdAt: ResourceCreatedAtSort.ASC },
      skip: 10,
      take: 10,
      select: {
        id: true,
        inventoryCode: true,
        name: true,
        category: true,
        status: true,
        supplierId: true,
        createdAt: true,
      },
    });
    expect(result).toEqual({
      data: [
        {
          id: 'resource-1',
          inventoryCode: 'INV-INFO-2026-0001',
          name: 'Ordinateur portable Dell Latitude 5440',
          category: 'Informatique',
          status: ResourceStatus.AVAILABLE,
          supplierId: 'supplier-1',
          createdAt: '2026-06-02T16:00:00.000Z',
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

  it('uses default pagination and caps list limit to 100', async () => {
    prisma.resource.count.mockResolvedValue(0);
    prisma.resource.findMany.mockResolvedValue([]);

    const result = await service.listResources({
      page: 0,
      limit: 250,
    });

    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 100,
        orderBy: { createdAt: ResourceCreatedAtSort.DESC },
      }),
    );
    expect(result.meta).toEqual({
      page: 1,
      limit: 100,
      total: 0,
      totalPages: 0,
    });
  });

  it('returns resource detail with supplier information when present', async () => {
    prisma.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: new Date('2026-06-02T00:00:00.000Z'),
      acquisitionValue: new Prisma.Decimal(12500),
      status: ResourceStatus.AVAILABLE,
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        status: 'ACTIVE',
      },
      createdAt: new Date('2026-06-02T16:00:00.000Z'),
      updatedAt: new Date('2026-06-02T16:30:00.000Z'),
    });

    const result = await service.getResourceById('resource-1');

    expect(prisma.resource.findUnique).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            phone: true,
            status: true,
          },
        },
      },
    });
    expect(result).toEqual({
      id: 'resource-1',
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: '12500',
      status: ResourceStatus.AVAILABLE,
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        status: 'ACTIVE',
      },
      createdAt: '2026-06-02T16:00:00.000Z',
      updatedAt: '2026-06-02T16:30:00.000Z',
    });
  });

  it('rejects resource detail retrieval when resource does not exist', async () => {
    prisma.resource.findUnique.mockResolvedValue(null);

    await expect(service.getResourceById('resource-unknown')).rejects.toThrow(
      new NotFoundException('Ressource introuvable.'),
    );
  });

  it('creates a resource with null optional fields when omitted', async () => {
    prisma.resource.findUnique.mockResolvedValue(null);
    prisma.resource.create.mockImplementation((args: ResourceCreateMockArgs) => ({
      id: 'resource-2',
      ...args.data,
      createdAt: new Date('2026-06-02T16:10:00.000Z'),
      updatedAt: new Date('2026-06-02T16:10:00.000Z'),
    }));

    const result = await service.createResource({
      name: 'Imprimante HP LaserJet',
      inventoryCode: 'INV-PRINT-2026-0001',
      category: 'Impression',
    });

    expect(prisma.supplier.findUnique).not.toHaveBeenCalled();
    expect(prisma.resource.create).toHaveBeenCalledWith({
      data: {
        name: 'Imprimante HP LaserJet',
        inventoryCode: 'INV-PRINT-2026-0001',
        category: 'Impression',
        description: null,
        serialNumber: null,
        acquisitionDate: null,
        acquisitionValue: null,
        status: ResourceStatus.AVAILABLE,
        supplierId: null,
      },
    });
    expect(result.status).toBe(ResourceStatus.AVAILABLE);
    expect(result.supplierId).toBeNull();
    expect(result.acquisitionValue).toBeNull();
  });

  it('rejects duplicate inventory code', async () => {
    prisma.resource.findUnique.mockResolvedValue({ id: 'resource-1' });

    await expect(
      service.createResource({
        name: 'Ordinateur portable Dell Latitude 5440',
        inventoryCode: 'INV-INFO-2026-0001',
        category: 'Informatique',
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Une ressource avec cette reference inventaire existe deja.',
      ),
    );
    expect(prisma.resource.create).not.toHaveBeenCalled();
  });

  it('rejects creation when supplier does not exist', async () => {
    prisma.resource.findUnique.mockResolvedValue(null);
    prisma.supplier.findUnique.mockResolvedValue(null);

    await expect(
      service.createResource({
        name: 'Ordinateur portable Dell Latitude 5440',
        inventoryCode: 'INV-INFO-2026-0001',
        category: 'Informatique',
        supplierId: 'supplier-unknown',
      }),
    ).rejects.toThrow(new NotFoundException('Fournisseur introuvable.'));
    expect(prisma.resource.create).not.toHaveBeenCalled();
  });
});
