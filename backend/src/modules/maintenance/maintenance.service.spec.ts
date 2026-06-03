import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  MaintenancePriority,
  MaintenanceSeverity,
  MaintenanceTicketStatus,
  Prisma,
  ResourceStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { MaintenanceService } from './maintenance.service';

type TransactionMock = {
  resource: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
  };
  maintenanceTicket: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  maintenanceIntervention: {
    findFirst: jest.Mock;
    create: jest.Mock;
    findUniqueOrThrow: jest.Mock;
  };
  maintenanceReport: {
    create: jest.Mock;
  };
};

type PrismaMock = {
  $transaction: jest.Mock;
};

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let prisma: PrismaMock;
  let tx: TransactionMock;

  beforeEach(() => {
    tx = {
      resource: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      maintenanceTicket: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      maintenanceIntervention: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      maintenanceReport: {
        create: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn((callback: (client: TransactionMock) => unknown) =>
        callback(tx),
      ),
    };
    service = new MaintenanceService(prisma as unknown as PrismaService);
  });

  it('creates an intervention and moves an open ticket to in progress in a transaction', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.OPEN,
      report: { id: 'report-1' },
    });
    tx.maintenanceIntervention.findFirst.mockResolvedValue(null);
    tx.maintenanceIntervention.create.mockResolvedValue({
      id: 'intervention-1',
    });
    tx.maintenanceTicket.update.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.IN_PROGRESS,
    });
    tx.maintenanceIntervention.findUniqueOrThrow.mockResolvedValue({
      id: 'intervention-1',
      maintenanceTicketId: 'ticket-1',
      technicianName: 'Technicien maintenance interne',
      description: 'Remplacement du bloc alimentation.',
      startedAt: new Date('2026-06-03T13:00:00.000Z'),
      completedAt: null,
      cost: null,
      result: null,
      createdAt: new Date('2026-06-03T13:00:00.000Z'),
      updatedAt: new Date('2026-06-03T13:00:00.000Z'),
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.IN_PROGRESS,
        priority: MaintenancePriority.HIGH,
        openedAt: new Date('2026-06-03T09:00:00.000Z'),
      },
    });

    const result = await service.createMaintenanceIntervention('ticket-1', {
      technicianName: ' Technicien maintenance interne ',
      description: ' Remplacement du bloc alimentation. ',
      startedAt: '2026-06-03T13:00:00.000Z',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.maintenanceTicket.findUnique).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      select: {
        id: true,
        status: true,
        report: { select: { id: true } },
      },
    });
    expect(tx.maintenanceIntervention.findFirst).toHaveBeenCalledWith({
      where: {
        maintenanceTicketId: 'ticket-1',
        completedAt: null,
      },
      select: { id: true },
    });
    expect(tx.maintenanceIntervention.create).toHaveBeenCalledWith({
      data: {
        maintenanceTicketId: 'ticket-1',
        technicianName: 'Technicien maintenance interne',
        description: 'Remplacement du bloc alimentation.',
        startedAt: new Date('2026-06-03T13:00:00.000Z'),
        completedAt: null,
        cost: null,
        result: null,
      },
    });
    expect(tx.maintenanceTicket.update).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      data: { status: MaintenanceTicketStatus.IN_PROGRESS },
    });
    expect(tx.maintenanceIntervention.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'intervention-1' },
      include: {
        maintenanceTicket: {
          select: {
            id: true,
            status: true,
            priority: true,
            openedAt: true,
          },
        },
      },
    });
    expect(result).toEqual({
      id: 'intervention-1',
      maintenanceTicketId: 'ticket-1',
      technicianName: 'Technicien maintenance interne',
      description: 'Remplacement du bloc alimentation.',
      startedAt: '2026-06-03T13:00:00.000Z',
      completedAt: null,
      cost: null,
      result: null,
      createdAt: '2026-06-03T13:00:00.000Z',
      updatedAt: '2026-06-03T13:00:00.000Z',
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.IN_PROGRESS,
        priority: MaintenancePriority.HIGH,
        openedAt: '2026-06-03T09:00:00.000Z',
      },
    });
  });

  it('creates a completed intervention with optional cost and result', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.IN_PROGRESS,
      report: { id: 'report-1' },
    });
    tx.maintenanceIntervention.findFirst.mockResolvedValue(null);
    tx.maintenanceIntervention.create.mockResolvedValue({
      id: 'intervention-1',
    });
    tx.maintenanceTicket.update.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.IN_PROGRESS,
    });
    tx.maintenanceIntervention.findUniqueOrThrow.mockResolvedValue({
      id: 'intervention-1',
      maintenanceTicketId: 'ticket-1',
      technicianName: 'Prestataire externe',
      description: 'Diagnostic et remplacement composant.',
      startedAt: new Date('2026-06-03T13:00:00.000Z'),
      completedAt: new Date('2026-06-03T15:00:00.000Z'),
      cost: { toString: () => '450' },
      result: 'Fonctionnement retabli.',
      createdAt: new Date('2026-06-03T13:00:00.000Z'),
      updatedAt: new Date('2026-06-03T15:00:00.000Z'),
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.IN_PROGRESS,
        priority: MaintenancePriority.HIGH,
        openedAt: new Date('2026-06-03T09:00:00.000Z'),
      },
    });

    const result = await service.createMaintenanceIntervention('ticket-1', {
      technicianName: 'Prestataire externe',
      description: 'Diagnostic et remplacement composant.',
      startedAt: '2026-06-03T13:00:00.000Z',
      completedAt: '2026-06-03T15:00:00.000Z',
      cost: 450,
      result: ' Fonctionnement retabli. ',
    });

    expect(tx.maintenanceIntervention.create).toHaveBeenCalledWith({
      data: {
        maintenanceTicketId: 'ticket-1',
        technicianName: 'Prestataire externe',
        description: 'Diagnostic et remplacement composant.',
        startedAt: new Date('2026-06-03T13:00:00.000Z'),
        completedAt: new Date('2026-06-03T15:00:00.000Z'),
        cost: new Prisma.Decimal(450),
        result: 'Fonctionnement retabli.',
      },
    });
    expect(result.cost).toBe('450');
    expect(result.completedAt).toBe('2026-06-03T15:00:00.000Z');
    expect(result.result).toBe('Fonctionnement retabli.');
  });

  it('rejects intervention when completed date is before started date', async () => {
    await expect(
      service.createMaintenanceIntervention('ticket-1', {
        technicianName: 'Technicien maintenance interne',
        description: 'Intervention technique.',
        startedAt: '2026-06-03T15:00:00.000Z',
        completedAt: '2026-06-03T13:00:00.000Z',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'La date de fin ne peut pas etre anterieure a la date de debut.',
      ),
    );
    expect(tx.maintenanceTicket.findUnique).not.toHaveBeenCalled();
  });

  it('rejects intervention when ticket does not exist', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue(null);

    await expect(
      service.createMaintenanceIntervention('ticket-unknown', {
        technicianName: 'Technicien maintenance interne',
        description: 'Intervention technique.',
        startedAt: '2026-06-03T13:00:00.000Z',
      }),
    ).rejects.toThrow(
      new NotFoundException('Ticket de maintenance introuvable.'),
    );
    expect(tx.maintenanceIntervention.create).not.toHaveBeenCalled();
  });

  it('rejects intervention when ticket has no report', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.OPEN,
      report: null,
    });

    await expect(
      service.createMaintenanceIntervention('ticket-1', {
        technicianName: 'Technicien maintenance interne',
        description: 'Intervention technique.',
        startedAt: '2026-06-03T13:00:00.000Z',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Un constat est obligatoire avant de creer une intervention.',
      ),
    );
    expect(tx.maintenanceIntervention.create).not.toHaveBeenCalled();
  });

  it.each([
    MaintenanceTicketStatus.RESOLVED,
    MaintenanceTicketStatus.CLOSED,
    MaintenanceTicketStatus.CANCELLED,
  ])('rejects intervention when ticket status is %s', async (status) => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status,
      report: { id: 'report-1' },
    });

    await expect(
      service.createMaintenanceIntervention('ticket-1', {
        technicianName: 'Technicien maintenance interne',
        description: 'Intervention technique.',
        startedAt: '2026-06-03T13:00:00.000Z',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Seul un ticket ouvert ou en cours peut recevoir une intervention.',
      ),
    );
    expect(tx.maintenanceIntervention.create).not.toHaveBeenCalled();
  });

  it('rejects intervention when an active intervention already exists', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.IN_PROGRESS,
      report: { id: 'report-1' },
    });
    tx.maintenanceIntervention.findFirst.mockResolvedValue({
      id: 'intervention-existing',
    });

    await expect(
      service.createMaintenanceIntervention('ticket-1', {
        technicianName: 'Technicien maintenance interne',
        description: 'Intervention technique.',
        startedAt: '2026-06-03T13:00:00.000Z',
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Une intervention active existe deja pour ce ticket de maintenance.',
      ),
    );
    expect(tx.maintenanceIntervention.create).not.toHaveBeenCalled();
    expect(tx.maintenanceTicket.update).not.toHaveBeenCalled();
  });

  it('creates a maintenance report for an open ticket in a transaction', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.OPEN,
      report: null,
    });
    tx.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: null,
    });
    tx.maintenanceReport.create.mockResolvedValue({
      id: 'report-1',
      maintenanceTicketId: 'ticket-1',
      authorId: 'user-1',
      diagnosis: 'Carte mere defectueuse apres test de demarrage.',
      probableCause: 'Surtension probable au niveau de l alimentation.',
      severity: MaintenanceSeverity.HIGH,
      recommendations: 'Remplacer la carte mere.',
      reportedAt: new Date('2026-06-03T11:00:00.000Z'),
      createdAt: new Date('2026-06-03T11:00:00.000Z'),
      updatedAt: new Date('2026-06-03T11:00:00.000Z'),
      author: {
        id: 'user-1',
        firstName: 'Amina',
        lastName: 'Bennani',
        email: 'amina.bennani@faculty.test',
      },
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.OPEN,
        priority: MaintenancePriority.HIGH,
        openedAt: new Date('2026-06-03T09:00:00.000Z'),
      },
    });

    const result = await service.createMaintenanceReport(
      'ticket-1',
      {
        diagnosis: ' Carte mere defectueuse apres test de demarrage. ',
        probableCause: ' Surtension probable au niveau de l alimentation. ',
        severity: MaintenanceSeverity.HIGH,
        recommendations: ' Remplacer la carte mere. ',
      },
      'user-1',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.maintenanceTicket.findUnique).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      select: {
        id: true,
        status: true,
        report: { select: { id: true } },
      },
    });
    expect(tx.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, deletedAt: true },
    });
    expect(tx.maintenanceReport.create).toHaveBeenCalledWith({
      data: {
        maintenanceTicketId: 'ticket-1',
        authorId: 'user-1',
        diagnosis: 'Carte mere defectueuse apres test de demarrage.',
        probableCause: 'Surtension probable au niveau de l alimentation.',
        severity: MaintenanceSeverity.HIGH,
        recommendations: 'Remplacer la carte mere.',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        maintenanceTicket: {
          select: {
            id: true,
            status: true,
            priority: true,
            openedAt: true,
          },
        },
      },
    });
    expect(result).toEqual({
      id: 'report-1',
      diagnosis: 'Carte mere defectueuse apres test de demarrage.',
      probableCause: 'Surtension probable au niveau de l alimentation.',
      severity: MaintenanceSeverity.HIGH,
      recommendations: 'Remplacer la carte mere.',
      reportedAt: '2026-06-03T11:00:00.000Z',
      author: {
        id: 'user-1',
        firstName: 'Amina',
        lastName: 'Bennani',
        email: 'amina.bennani@faculty.test',
      },
      maintenanceTicket: {
        id: 'ticket-1',
        status: MaintenanceTicketStatus.OPEN,
        priority: MaintenancePriority.HIGH,
        openedAt: '2026-06-03T09:00:00.000Z',
      },
    });
  });

  it('rejects maintenance report when ticket does not exist', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue(null);

    await expect(
      service.createMaintenanceReport(
        'ticket-unknown',
        {
          diagnosis: 'Diagnostic technique.',
          probableCause: 'Cause probable.',
          severity: MaintenanceSeverity.MEDIUM,
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new NotFoundException('Ticket de maintenance introuvable.'),
    );
    expect(tx.maintenanceReport.create).not.toHaveBeenCalled();
  });

  it.each([
    MaintenanceTicketStatus.RESOLVED,
    MaintenanceTicketStatus.CLOSED,
    MaintenanceTicketStatus.CANCELLED,
  ])('rejects maintenance report when ticket status is %s', async (status) => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status,
      report: null,
    });

    await expect(
      service.createMaintenanceReport(
        'ticket-1',
        {
          diagnosis: 'Diagnostic technique.',
          probableCause: 'Cause probable.',
          severity: MaintenanceSeverity.MEDIUM,
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new BadRequestException(
        'Seul un ticket ouvert ou en cours peut recevoir un constat.',
      ),
    );
    expect(tx.user.findUnique).not.toHaveBeenCalled();
    expect(tx.maintenanceReport.create).not.toHaveBeenCalled();
  });

  it('rejects maintenance report when a report already exists', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.IN_PROGRESS,
      report: { id: 'report-existing' },
    });

    await expect(
      service.createMaintenanceReport(
        'ticket-1',
        {
          diagnosis: 'Diagnostic technique.',
          probableCause: 'Cause probable.',
          severity: MaintenanceSeverity.MEDIUM,
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new ConflictException(
        'Un constat existe deja pour ce ticket de maintenance.',
      ),
    );
    expect(tx.user.findUnique).not.toHaveBeenCalled();
    expect(tx.maintenanceReport.create).not.toHaveBeenCalled();
  });

  it('rejects maintenance report when author does not exist', async () => {
    tx.maintenanceTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: MaintenanceTicketStatus.OPEN,
      report: null,
    });
    tx.user.findUnique.mockResolvedValue(null);

    await expect(
      service.createMaintenanceReport(
        'ticket-1',
        {
          diagnosis: 'Diagnostic technique.',
          probableCause: 'Cause probable.',
          severity: MaintenanceSeverity.MEDIUM,
        },
        'user-unknown',
      ),
    ).rejects.toThrow(new NotFoundException('Auteur du constat introuvable.'));
    expect(tx.maintenanceReport.create).not.toHaveBeenCalled();
  });

  it('creates a maintenance ticket and marks the resource under maintenance in a transaction', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });
    tx.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: null,
    });
    tx.maintenanceTicket.create.mockResolvedValue({
      id: 'ticket-1',
      resourceId: 'resource-1',
      reportedById: 'user-1',
      description: 'Le poste ne demarre plus.',
      priority: MaintenancePriority.HIGH,
      status: MaintenanceTicketStatus.OPEN,
      openedAt: new Date('2026-06-03T09:00:00.000Z'),
      closedAt: null,
      createdAt: new Date('2026-06-03T09:00:00.000Z'),
      updatedAt: new Date('2026-06-03T09:00:00.000Z'),
    });
    tx.resource.update.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.UNDER_MAINTENANCE,
    });

    const result = await service.reportFailure(
      {
        resourceId: 'resource-1',
        description: ' Le poste ne demarre plus. ',
        priority: MaintenancePriority.HIGH,
      },
      'user-1',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.resource.findUnique).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      select: { id: true, status: true },
    });
    expect(tx.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, deletedAt: true },
    });
    expect(tx.maintenanceTicket.create).toHaveBeenCalledWith({
      data: {
        resourceId: 'resource-1',
        reportedById: 'user-1',
        description: 'Le poste ne demarre plus.',
        priority: MaintenancePriority.HIGH,
        status: MaintenanceTicketStatus.OPEN,
      },
    });
    expect(tx.resource.update).toHaveBeenCalledWith({
      where: { id: 'resource-1' },
      data: { status: ResourceStatus.UNDER_MAINTENANCE },
    });
    expect(result).toEqual({
      id: 'ticket-1',
      resourceId: 'resource-1',
      reportedById: 'user-1',
      description: 'Le poste ne demarre plus.',
      priority: MaintenancePriority.HIGH,
      status: MaintenanceTicketStatus.OPEN,
      openedAt: '2026-06-03T09:00:00.000Z',
      closedAt: null,
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T09:00:00.000Z',
    });
  });

  it('rejects failure report when resource does not exist', async () => {
    tx.resource.findUnique.mockResolvedValue(null);

    await expect(
      service.reportFailure(
        {
          resourceId: 'resource-unknown',
          description: 'Panne materielle.',
          priority: MaintenancePriority.MEDIUM,
        },
        'user-1',
      ),
    ).rejects.toThrow(new NotFoundException('Ressource introuvable.'));
    expect(tx.maintenanceTicket.create).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });

  it('rejects failure report when resource is archived', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.ARCHIVED,
    });

    await expect(
      service.reportFailure(
        {
          resourceId: 'resource-1',
          description: 'Panne materielle.',
          priority: MaintenancePriority.MEDIUM,
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new BadRequestException(
        'Impossible de signaler une panne sur une ressource archivee.',
      ),
    );
    expect(tx.user.findUnique).not.toHaveBeenCalled();
    expect(tx.maintenanceTicket.create).not.toHaveBeenCalled();
  });

  it('rejects failure report when resource is already under maintenance', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.UNDER_MAINTENANCE,
    });

    await expect(
      service.reportFailure(
        {
          resourceId: 'resource-1',
          description: 'Panne materielle.',
          priority: MaintenancePriority.MEDIUM,
        },
        'user-1',
      ),
    ).rejects.toThrow(
      new BadRequestException('Cette ressource est deja en maintenance.'),
    );
    expect(tx.user.findUnique).not.toHaveBeenCalled();
    expect(tx.maintenanceTicket.create).not.toHaveBeenCalled();
  });

  it('rejects failure report when reporter does not exist', async () => {
    tx.resource.findUnique.mockResolvedValue({
      id: 'resource-1',
      status: ResourceStatus.AVAILABLE,
    });
    tx.user.findUnique.mockResolvedValue(null);

    await expect(
      service.reportFailure(
        {
          resourceId: 'resource-1',
          description: 'Panne materielle.',
          priority: MaintenancePriority.MEDIUM,
        },
        'user-unknown',
      ),
    ).rejects.toThrow(
      new NotFoundException('Utilisateur declarant introuvable.'),
    );
    expect(tx.maintenanceTicket.create).not.toHaveBeenCalled();
    expect(tx.resource.update).not.toHaveBeenCalled();
  });
});
