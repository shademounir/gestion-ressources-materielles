import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import {
  SupplierOfferStatus,
  SupplierStatus,
  TenderStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SupplierOffersService } from './supplier-offers.service';

type PrismaMock = {
  $transaction: jest.Mock;
  tender: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  supplier: {
    findUnique: jest.Mock;
  };
  supplierOffer: {
    count: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
};

describe('SupplierOffersService', () => {
  let service: SupplierOffersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(async (callback: (tx: PrismaMock) => Promise<unknown>) =>
        callback(prisma),
      ),
      tender: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      supplier: {
        findUnique: jest.fn(),
      },
      supplierOffer: {
        count: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    service = new SupplierOffersService(prisma as unknown as PrismaService);
  });

  it('lists supplier offers with pagination and filters', async () => {
    prisma.supplierOffer.count.mockResolvedValue(1);
    prisma.supplierOffer.findMany.mockResolvedValue([
      {
        id: 'offer-1',
        tenderId: 'tender-1',
        supplierId: 'supplier-1',
        amount: 125000,
        proposedDeliveryDays: 30,
        comment: 'Livraison possible en deux lots.',
        status: SupplierOfferStatus.SUBMITTED,
        submittedAt: new Date('2026-06-02T14:00:00.000Z'),
        selectedAt: null,
        createdAt: new Date('2026-06-02T14:00:00.000Z'),
        updatedAt: new Date('2026-06-02T14:00:00.000Z'),
      },
    ]);

    const result = await service.listSupplierOffers({
      page: 2,
      limit: 8,
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      status: SupplierOfferStatus.SUBMITTED,
    });

    const expectedWhere = {
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      status: SupplierOfferStatus.SUBMITTED,
    };

    expect(prisma.supplierOffer.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
    expect(prisma.supplierOffer.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { submittedAt: 'desc' },
      skip: 8,
      take: 8,
    });
    expect(result).toEqual({
      data: [
        {
          id: 'offer-1',
          tenderId: 'tender-1',
          supplierId: 'supplier-1',
          amount: 125000,
          proposedDeliveryDays: 30,
          comment: 'Livraison possible en deux lots.',
          status: SupplierOfferStatus.SUBMITTED,
          submittedAt: '2026-06-02T14:00:00.000Z',
          selectedAt: null,
          createdAt: '2026-06-02T14:00:00.000Z',
          updatedAt: '2026-06-02T14:00:00.000Z',
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

  it('lists supplier offers for a tender with scoped filters', async () => {
    prisma.supplierOffer.count.mockResolvedValue(0);
    prisma.supplierOffer.findMany.mockResolvedValue([]);

    const result = await service.listSupplierOffersForTender('tender-1', {
      page: 1,
      limit: 8,
      supplierId: 'supplier-1',
      status: SupplierOfferStatus.SELECTED,
    });

    const expectedWhere = {
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      status: SupplierOfferStatus.SELECTED,
    };

    expect(prisma.supplierOffer.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
    expect(prisma.supplierOffer.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { submittedAt: 'desc' },
      skip: 0,
      take: 8,
    });
    expect(result).toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 0,
      },
    });
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
      selectedAt: null,
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
      selectedAt: null,
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
      selectedAt: null,
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

  it('returns supplier offer detail with tender and supplier', async () => {
    prisma.supplierOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: new Date('2026-06-02T14:00:00.000Z'),
      selectedAt: null,
      createdAt: new Date('2026-06-02T14:00:00.000Z'),
      updatedAt: new Date('2026-06-02T14:00:00.000Z'),
      tender: {
        id: 'tender-1',
        reference: 'AO-20260602-0001',
        title: 'Appel d offres - Equipement salle informatique',
        status: TenderStatus.PUBLISHED,
        deadline: new Date('2026-07-15T12:00:00.000Z'),
      },
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        status: SupplierStatus.ACTIVE,
      },
    });

    const result = await service.getSupplierOfferById('offer-1');

    expect(prisma.supplierOffer.findUnique).toHaveBeenCalledWith({
      where: { id: 'offer-1' },
      include: {
        tender: {
          select: {
            id: true,
            reference: true,
            title: true,
            status: true,
            deadline: true,
          },
        },
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
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: '2026-06-02T14:00:00.000Z',
      selectedAt: null,
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T14:00:00.000Z',
      tender: {
        id: 'tender-1',
        reference: 'AO-20260602-0001',
        title: 'Appel d offres - Equipement salle informatique',
        status: TenderStatus.PUBLISHED,
        deadline: '2026-07-15T12:00:00.000Z',
      },
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        status: SupplierStatus.ACTIVE,
      },
    });
  });

  it('rejects supplier offer detail retrieval when offer does not exist', async () => {
    prisma.supplierOffer.findUnique.mockResolvedValue(null);

    await expect(service.getSupplierOfferById('offer-unknown')).rejects.toThrow(
      new NotFoundException('Offre fournisseur introuvable.'),
    );
  });

  it('selects a supplier offer, rejects competing offers and awards the tender atomically', async () => {
    prisma.supplierOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: new Date('2026-06-02T14:00:00.000Z'),
      selectedAt: null,
      createdAt: new Date('2026-06-02T14:00:00.000Z'),
      updatedAt: new Date('2026-06-02T14:00:00.000Z'),
      tender: {
        id: 'tender-1',
        status: TenderStatus.PUBLISHED,
      },
    });
    prisma.supplierOffer.findFirst.mockResolvedValue(null);
    prisma.supplierOffer.updateMany.mockResolvedValue({ count: 2 });
    prisma.supplierOffer.update.mockResolvedValue({
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SELECTED,
      submittedAt: new Date('2026-06-02T14:00:00.000Z'),
      selectedAt: new Date('2026-06-02T15:00:00.000Z'),
      createdAt: new Date('2026-06-02T14:00:00.000Z'),
      updatedAt: new Date('2026-06-02T15:00:00.000Z'),
    });
    prisma.tender.update.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.AWARDED,
      awardedAt: new Date('2026-06-02T15:00:00.000Z'),
    });

    const result = await service.selectSupplierOffer('offer-1');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.supplierOffer.findUnique).toHaveBeenCalledWith({
      where: { id: 'offer-1' },
      include: {
        tender: {
          select: { id: true, status: true },
        },
      },
    });
    expect(prisma.supplierOffer.findFirst).toHaveBeenCalledWith({
      where: {
        tenderId: 'tender-1',
        status: SupplierOfferStatus.SELECTED,
      },
      select: { id: true },
    });
    expect(prisma.supplierOffer.updateMany).toHaveBeenCalledWith({
      where: {
        tenderId: 'tender-1',
        id: { not: 'offer-1' },
      },
      data: {
        status: SupplierOfferStatus.REJECTED,
      },
    });
    const [offerUpdateInput] = prisma.supplierOffer.update.mock.calls[0] as [
      {
        where: { id: string };
        data: { status: SupplierOfferStatus; selectedAt: Date };
      },
    ];
    expect(offerUpdateInput.data.selectedAt).toBeInstanceOf(Date);
    expect(offerUpdateInput).toEqual({
      where: { id: 'offer-1' },
      data: {
        status: SupplierOfferStatus.SELECTED,
        selectedAt: offerUpdateInput.data.selectedAt,
      },
    });
    const [tenderUpdateInput] = prisma.tender.update.mock.calls[0] as [
      {
        where: { id: string };
        data: { status: TenderStatus; awardedAt: Date };
      },
    ];
    expect(tenderUpdateInput.data.awardedAt).toBe(offerUpdateInput.data.selectedAt);
    expect(tenderUpdateInput).toEqual({
      where: { id: 'tender-1' },
      data: {
        status: TenderStatus.AWARDED,
        awardedAt: offerUpdateInput.data.selectedAt,
      },
    });
    expect(result).toEqual({
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SELECTED,
      submittedAt: '2026-06-02T14:00:00.000Z',
      selectedAt: '2026-06-02T15:00:00.000Z',
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T15:00:00.000Z',
    });
  });

  it('rejects selection when supplier offer does not exist', async () => {
    prisma.supplierOffer.findUnique.mockResolvedValue(null);

    await expect(service.selectSupplierOffer('offer-unknown')).rejects.toThrow(
      new NotFoundException('Offre fournisseur introuvable.'),
    );
    expect(prisma.supplierOffer.update).not.toHaveBeenCalled();
    expect(prisma.tender.update).not.toHaveBeenCalled();
  });

  it.each([SupplierOfferStatus.REJECTED, SupplierOfferStatus.SELECTED])(
    'rejects selection when supplier offer status is %s',
    async (status) => {
      prisma.supplierOffer.findUnique.mockResolvedValue({
        id: 'offer-1',
        tenderId: 'tender-1',
        status,
        tender: {
          id: 'tender-1',
          status: TenderStatus.PUBLISHED,
        },
      });

      await expect(service.selectSupplierOffer('offer-1')).rejects.toThrow(
        new BadRequestException(
          'Seule une offre soumise ou en cours de revue peut etre selectionnee.',
        ),
      );
      expect(prisma.supplierOffer.update).not.toHaveBeenCalled();
      expect(prisma.tender.update).not.toHaveBeenCalled();
    },
  );

  it.each([TenderStatus.DRAFT, TenderStatus.CLOSED, TenderStatus.CANCELLED])(
    'rejects selection when tender status is %s',
    async (status) => {
      prisma.supplierOffer.findUnique.mockResolvedValue({
        id: 'offer-1',
        tenderId: 'tender-1',
        status: SupplierOfferStatus.SUBMITTED,
        tender: {
          id: 'tender-1',
          status,
        },
      });

      await expect(service.selectSupplierOffer('offer-1')).rejects.toThrow(
        new BadRequestException(
          'Seul un appel d offres publie peut avoir une offre selectionnee.',
        ),
      );
      expect(prisma.supplierOffer.update).not.toHaveBeenCalled();
      expect(prisma.tender.update).not.toHaveBeenCalled();
    },
  );

  it('rejects selection when a winning offer already exists for the tender', async () => {
    prisma.supplierOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      tenderId: 'tender-1',
      status: SupplierOfferStatus.UNDER_REVIEW,
      tender: {
        id: 'tender-1',
        status: TenderStatus.PUBLISHED,
      },
    });
    prisma.supplierOffer.findFirst.mockResolvedValue({ id: 'offer-selected' });

    await expect(service.selectSupplierOffer('offer-1')).rejects.toThrow(
      new ConflictException('Une offre gagnante existe deja pour cet appel d offres.'),
    );
    expect(prisma.supplierOffer.update).not.toHaveBeenCalled();
    expect(prisma.tender.update).not.toHaveBeenCalled();
  });
});
