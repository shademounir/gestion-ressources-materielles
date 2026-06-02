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
});
