import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, ResourceStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ResourcesService } from './resources.service';

type PrismaMock = {
  resource: {
    findUnique: jest.Mock;
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
        findUnique: jest.fn(),
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
