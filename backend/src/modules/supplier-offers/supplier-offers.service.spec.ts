import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import {
  SupplierOfferStatus,
  SupplierStatus,
  TenderStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SupplierOffersService } from './supplier-offers.service';

type PrismaMock = {
  tender: {
    findUnique: jest.Mock;
  };
  supplier: {
    findUnique: jest.Mock;
  };
  supplierOffer: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

describe('SupplierOffersService', () => {
  let service: SupplierOffersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      tender: {
        findUnique: jest.fn(),
      },
      supplier: {
        findUnique: jest.fn(),
      },
      supplierOffer: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new SupplierOffersService(prisma as unknown as PrismaService);
  });

  it('creates a submitted supplier offer for a published tender and active supplier', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });
    prisma.supplier.findUnique.mockResolvedValue({
      id: 'supplier-1',
      status: SupplierStatus.ACTIVE,
    });
    prisma.supplierOffer.findUnique.mockResolvedValue(null);
    prisma.supplierOffer.create.mockResolvedValue({
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: new Date('2026-06-02T14:00:00.000Z'),
      createdAt: new Date('2026-06-02T14:00:00.000Z'),
      updatedAt: new Date('2026-06-02T14:00:00.000Z'),
    });

    const result = await service.createSupplierOffer({
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: ' Livraison possible en deux lots. ',
    });

    expect(prisma.tender.findUnique).toHaveBeenCalledWith({
      where: { id: 'tender-1' },
      select: { id: true, status: true, deadline: true },
    });
    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: 'supplier-1' },
      select: { id: true, status: true },
    });
    expect(prisma.supplierOffer.findUnique).toHaveBeenCalledWith({
      where: {
        tenderId_supplierId: {
          tenderId: 'tender-1',
          supplierId: 'supplier-1',
        },
      },
      select: { id: true },
    });
    const [createInput] = prisma.supplierOffer.create.mock.calls[0] as [
      {
        data: {
          tenderId: string;
          supplierId: string;
          amount: number;
          proposedDeliveryDays: number;
          comment: string | null;
          status: SupplierOfferStatus;
          submittedAt: Date;
        };
      },
    ];
    expect(createInput.data.submittedAt).toBeInstanceOf(Date);
    expect(createInput).toEqual({
      data: {
        tenderId: 'tender-1',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
        comment: 'Livraison possible en deux lots.',
        status: SupplierOfferStatus.SUBMITTED,
        submittedAt: createInput.data.submittedAt,
      },
    });
    expect(result).toEqual({
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: '2026-06-02T14:00:00.000Z',
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T14:00:00.000Z',
    });
  });

  it('creates a supplier offer with a null comment when omitted', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });
    prisma.supplier.findUnique.mockResolvedValue({
      id: 'supplier-1',
      status: SupplierStatus.ACTIVE,
    });
    prisma.supplierOffer.findUnique.mockResolvedValue(null);
    prisma.supplierOffer.create.mockResolvedValue({
      id: 'offer-2',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 95000,
      proposedDeliveryDays: 20,
      comment: null,
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: new Date('2026-06-02T14:10:00.000Z'),
      createdAt: new Date('2026-06-02T14:10:00.000Z'),
      updatedAt: new Date('2026-06-02T14:10:00.000Z'),
    });

    const result = await service.createSupplierOffer({
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 95000,
      proposedDeliveryDays: 20,
    });

    const [createInput] = prisma.supplierOffer.create.mock.calls[0] as [
      {
        data: {
          comment: string | null;
          status: SupplierOfferStatus;
        };
      },
    ];
    expect(createInput.data.comment).toBeNull();
    expect(createInput.data.status).toBe(SupplierOfferStatus.SUBMITTED);
    expect(result.comment).toBeNull();
  });

  it('rejects creation when tender does not exist', async () => {
    prisma.tender.findUnique.mockResolvedValue(null);

    await expect(
      service.createSupplierOffer({
        tenderId: 'tender-unknown',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
      }),
    ).rejects.toThrow(new NotFoundException('Appel d offres introuvable.'));
  });

  it('rejects creation when tender is not published', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.DRAFT,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });

    await expect(
      service.createSupplierOffer({
        tenderId: 'tender-1',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
      }),
    ).rejects.toThrow(
      new BadRequestException('Seul un appel d offres publie peut recevoir une offre.'),
    );
  });

  it('rejects creation when tender is expired', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2020-01-01T12:00:00.000Z'),
    });

    await expect(
      service.createSupplierOffer({
        tenderId: 'tender-1',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
      }),
    ).rejects.toThrow(new BadRequestException('Appel d offres expire.'));
  });

  it('rejects creation when supplier does not exist', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });
    prisma.supplier.findUnique.mockResolvedValue(null);

    await expect(
      service.createSupplierOffer({
        tenderId: 'tender-1',
        supplierId: 'supplier-unknown',
        amount: 125000,
        proposedDeliveryDays: 30,
      }),
    ).rejects.toThrow(new NotFoundException('Fournisseur introuvable.'));
  });

  it('rejects creation when supplier is inactive', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });
    prisma.supplier.findUnique.mockResolvedValue({
      id: 'supplier-1',
      status: SupplierStatus.INACTIVE,
    });

    await expect(
      service.createSupplierOffer({
        tenderId: 'tender-1',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
      }),
    ).rejects.toThrow(
      new BadRequestException('Le fournisseur doit etre actif pour deposer une offre.'),
    );
  });

  it('rejects duplicate supplier offer for the same tender and supplier', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });
    prisma.supplier.findUnique.mockResolvedValue({
      id: 'supplier-1',
      status: SupplierStatus.ACTIVE,
    });
    prisma.supplierOffer.findUnique.mockResolvedValue({ id: 'offer-existing' });

    await expect(
      service.createSupplierOffer({
        tenderId: 'tender-1',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Une offre existe deja pour ce fournisseur et cet appel d offres.',
      ),
    );
    expect(prisma.supplierOffer.create).not.toHaveBeenCalled();
  });
});
