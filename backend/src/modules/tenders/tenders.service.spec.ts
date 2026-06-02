import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TenderStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TendersService } from './tenders.service';

type PrismaMock = {
  need: {
    findUnique: jest.Mock;
  };
  tender: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

describe('TendersService', () => {
  let service: TendersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      need: {
        findUnique: jest.fn(),
      },
      tender: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new TendersService(prisma as unknown as PrismaService);
  });

  it('creates a draft tender from an existing need with a unique provided reference', async () => {
    prisma.need.findUnique.mockResolvedValue({ id: 'need-1' });
    prisma.tender.findFirst.mockResolvedValue(null);
    prisma.tender.findUnique.mockResolvedValue(null);
    prisma.tender.create.mockResolvedValue({
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.DRAFT,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
      publishedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: new Date('2026-06-02T12:00:00.000Z'),
      updatedAt: new Date('2026-06-02T12:00:00.000Z'),
    });

    const result = await service.createTender(
      {
        reference: ' ao-20260602-0001 ',
        title: ' Appel d offres - Equipement salle informatique ',
        description: ' Acquisition de postes informatiques pour la salle A12. ',
        deadline: '2026-07-15T12:00:00.000Z',
        needId: 'need-1',
      },
      'user-1',
    );

    expect(prisma.need.findUnique).toHaveBeenCalledWith({
      where: { id: 'need-1' },
      select: { id: true },
    });
    expect(prisma.tender.findFirst).toHaveBeenCalledWith({
      where: {
        needId: 'need-1',
        status: {
          notIn: [TenderStatus.CANCELLED, TenderStatus.ARCHIVED],
        },
      },
      select: { id: true },
    });
    expect(prisma.tender.findUnique).toHaveBeenCalledWith({
      where: { reference: 'AO-20260602-0001' },
      select: { id: true },
    });
    expect(prisma.tender.create).toHaveBeenCalledWith({
      data: {
        reference: 'AO-20260602-0001',
        title: 'Appel d offres - Equipement salle informatique',
        description: 'Acquisition de postes informatiques pour la salle A12.',
        status: TenderStatus.DRAFT,
        deadline: new Date('2026-07-15T12:00:00.000Z'),
        needId: 'need-1',
        createdById: 'user-1',
      },
    });
    expect(result).toEqual({
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.DRAFT,
      deadline: '2026-07-15T12:00:00.000Z',
      publishedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T12:00:00.000Z',
    });
  });

  it('generates a unique reference when no reference is provided', async () => {
    prisma.need.findUnique.mockResolvedValue({ id: 'need-1' });
    prisma.tender.findFirst.mockResolvedValue(null);
    prisma.tender.findUnique.mockResolvedValue(null);
    prisma.tender.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'tender-2',
        ...data,
        createdAt: new Date('2026-06-02T12:10:00.000Z'),
        updatedAt: new Date('2026-06-02T12:10:00.000Z'),
      }),
    );

    const result = await service.createTender(
      {
        title: 'Appel d offres - Equipement reseau',
        description: 'Acquisition de materiel reseau pour le departement.',
        deadline: '2026-08-01T12:00:00.000Z',
        needId: 'need-1',
      },
      'user-1',
    );

    expect(result.reference).toMatch(/^AO-\d{8}-[A-F0-9]{8}$/);
    expect(result.publishedAt).toBeNull();
    expect(prisma.tender.create).toHaveBeenCalledWith({
      data: {
        reference: result.reference,
        title: 'Appel d offres - Equipement reseau',
        description: 'Acquisition de materiel reseau pour le departement.',
        status: TenderStatus.DRAFT,
        deadline: new Date('2026-08-01T12:00:00.000Z'),
        needId: 'need-1',
        createdById: 'user-1',
      },
    });
  });

  it('rejects a deadline that is not future', async () => {
    await expect(
      service.createTender(
        {
          title: 'Appel d offres - Equipement salle informatique',
          description: 'Acquisition de postes informatiques pour la salle A12.',
          deadline: '2020-01-01T12:00:00.000Z',
          needId: 'need-1',
        },
        'user-1',
      ),
    ).rejects.toThrow(new BadRequestException('La date limite doit etre future.'));
    expect(prisma.need.findUnique).not.toHaveBeenCalled();
  });

  it('rejects creation when the need does not exist', async () => {
    prisma.need.findUnique.mockResolvedValue(null);

    await expect(
      service.createTender(
        {
          title: 'Appel d offres - Equipement salle informatique',
          description: 'Acquisition de postes informatiques pour la salle A12.',
          deadline: '2026-07-15T12:00:00.000Z',
          needId: 'need-unknown',
        },
        'user-1',
      ),
    ).rejects.toThrow(new NotFoundException('Besoin introuvable.'));
  });

  it('rejects creation when an active tender already exists for the need', async () => {
    prisma.need.findUnique.mockResolvedValue({ id: 'need-1' });
    prisma.tender.findFirst.mockResolvedValue({ id: 'tender-existing' });

    await expect(
      service.createTender(
        {
          title: 'Appel d offres - Equipement salle informatique',
          description: 'Acquisition de postes informatiques pour la salle A12.',
          deadline: '2026-07-15T12:00:00.000Z',
          needId: 'need-1',
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new ConflictException('Un appel d offres actif existe deja pour ce besoin.'),
    );
    expect(prisma.tender.create).not.toHaveBeenCalled();
  });

  it('rejects creation when provided reference already exists', async () => {
    prisma.need.findUnique.mockResolvedValue({ id: 'need-1' });
    prisma.tender.findFirst.mockResolvedValue(null);
    prisma.tender.findUnique.mockResolvedValue({ id: 'tender-existing' });

    await expect(
      service.createTender(
        {
          reference: 'AO-20260602-0001',
          title: 'Appel d offres - Equipement salle informatique',
          description: 'Acquisition de postes informatiques pour la salle A12.',
          deadline: '2026-07-15T12:00:00.000Z',
          needId: 'need-1',
        },
        'user-1',
      ),
    ).rejects.toThrow(new ConflictException('Reference appel d offres deja utilisee.'));
    expect(prisma.tender.create).not.toHaveBeenCalled();
  });

  it('publishes a draft tender with a future deadline', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.DRAFT,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
      publishedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: new Date('2026-06-02T12:00:00.000Z'),
      updatedAt: new Date('2026-06-02T12:00:00.000Z'),
    });
    prisma.tender.update.mockResolvedValue({
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
      publishedAt: new Date('2026-06-02T13:00:00.000Z'),
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: new Date('2026-06-02T12:00:00.000Z'),
      updatedAt: new Date('2026-06-02T13:00:00.000Z'),
    });

    const result = await service.publishTender('tender-1');

    expect(prisma.tender.findUnique).toHaveBeenCalledWith({
      where: { id: 'tender-1' },
    });
    const [updateInput] = prisma.tender.update.mock.calls[0] as [
      {
        where: { id: string };
        data: { status: TenderStatus; publishedAt: Date };
      },
    ];
    expect(updateInput.data.publishedAt).toBeInstanceOf(Date);
    expect(updateInput).toEqual({
      where: { id: 'tender-1' },
      data: {
        status: TenderStatus.PUBLISHED,
        publishedAt: updateInput.data.publishedAt,
      },
    });
    expect(result).toEqual({
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel d offres - Equipement salle informatique',
      description: 'Acquisition de postes informatiques pour la salle A12.',
      status: TenderStatus.PUBLISHED,
      deadline: '2026-07-15T12:00:00.000Z',
      publishedAt: '2026-06-02T13:00:00.000Z',
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T13:00:00.000Z',
    });
  });

  it('rejects publication when tender does not exist', async () => {
    prisma.tender.findUnique.mockResolvedValue(null);

    await expect(service.publishTender('tender-unknown')).rejects.toThrow(
      new NotFoundException('Appel d offres introuvable.'),
    );
    expect(prisma.tender.update).not.toHaveBeenCalled();
  });

  it.each([
    TenderStatus.PUBLISHED,
    TenderStatus.CANCELLED,
    TenderStatus.CLOSED,
    TenderStatus.AWARDED,
  ])('rejects publication when tender status is %s', async (status) => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status,
      deadline: new Date('2026-07-15T12:00:00.000Z'),
    });

    await expect(service.publishTender('tender-1')).rejects.toThrow(
      new BadRequestException('Seul un appel d offres en brouillon peut etre publie.'),
    );
    expect(prisma.tender.update).not.toHaveBeenCalled();
  });

  it('rejects publication when tender deadline has expired', async () => {
    prisma.tender.findUnique.mockResolvedValue({
      id: 'tender-1',
      status: TenderStatus.DRAFT,
      deadline: new Date('2020-01-01T12:00:00.000Z'),
    });

    await expect(service.publishTender('tender-1')).rejects.toThrow(
      new BadRequestException(
        'La date limite doit etre future pour publier l appel d offres.',
      ),
    );
    expect(prisma.tender.update).not.toHaveBeenCalled();
  });
});
