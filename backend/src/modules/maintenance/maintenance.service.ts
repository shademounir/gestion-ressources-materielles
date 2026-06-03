import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MaintenanceIntervention,
  MaintenancePriority,
  MaintenanceReport,
  MaintenanceTicket,
  MaintenanceTicketStatus,
  Prisma,
  ResourceStatus,
  SupplierReturn,
  SupplierReturnStatus,
  SupplierStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateMaintenanceInterventionDto } from './dto/create-maintenance-intervention.dto';
import { CreateMaintenanceReportDto } from './dto/create-maintenance-report.dto';
import { CreateMaintenanceTicketDto } from './dto/create-maintenance-ticket.dto';
import { CreateSupplierReturnDto } from './dto/create-supplier-return.dto';
import { MaintenanceInterventionResponseDto } from './dto/maintenance-intervention-response.dto';
import { MaintenanceReportResponseDto } from './dto/maintenance-report-response.dto';
import { MaintenanceTicketResponseDto } from './dto/maintenance-ticket-response.dto';
import { SupplierReturnResponseDto } from './dto/supplier-return-response.dto';

const maintenanceReportInclude = {
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
} satisfies Prisma.MaintenanceReportInclude;

const maintenanceInterventionInclude = {
  maintenanceTicket: {
    select: {
      id: true,
      status: true,
      priority: true,
      openedAt: true,
    },
  },
} satisfies Prisma.MaintenanceInterventionInclude;

const supplierReturnInclude = {
  maintenanceTicket: {
    select: {
      id: true,
      status: true,
      priority: true,
      openedAt: true,
    },
  },
  resource: {
    select: {
      id: true,
      inventoryCode: true,
      name: true,
      status: true,
    },
  },
  supplier: {
    select: {
      id: true,
      name: true,
      contactEmail: true,
      status: true,
    },
  },
} satisfies Prisma.SupplierReturnInclude;

const ACTIVE_SUPPLIER_RETURN_STATUSES = [
  SupplierReturnStatus.SENT_TO_SUPPLIER,
  SupplierReturnStatus.IN_REPAIR,
];

type MaintenanceReportWithRelations = MaintenanceReport & {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  maintenanceTicket: {
    id: string;
    status: MaintenanceTicketStatus;
    priority: MaintenancePriority;
    openedAt: Date;
  };
};

type MaintenanceInterventionWithRelations = MaintenanceIntervention & {
  maintenanceTicket: {
    id: string;
    status: MaintenanceTicketStatus;
    priority: MaintenancePriority;
    openedAt: Date;
  };
};

type SupplierReturnWithRelations = SupplierReturn & {
  maintenanceTicket: {
    id: string;
    status: MaintenanceTicketStatus;
    priority: MaintenancePriority;
    openedAt: Date;
  };
  resource: {
    id: string;
    inventoryCode: string;
    name: string;
    status: ResourceStatus;
  };
  supplier: {
    id: string;
    name: string;
    contactEmail: string | null;
    status: SupplierStatus;
  };
};

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async reportFailure(
    createMaintenanceTicketDto: CreateMaintenanceTicketDto,
    reportedById: string,
  ): Promise<MaintenanceTicketResponseDto> {
    const description = createMaintenanceTicketDto.description.trim();

    const ticket = await this.prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: createMaintenanceTicketDto.resourceId },
        select: { id: true, status: true },
      });

      if (!resource) {
        throw new NotFoundException('Ressource introuvable.');
      }

      if (resource.status === ResourceStatus.ARCHIVED) {
        throw new BadRequestException(
          'Impossible de signaler une panne sur une ressource archivee.',
        );
      }

      if (resource.status === ResourceStatus.UNDER_MAINTENANCE) {
        throw new BadRequestException(
          'Cette ressource est deja en maintenance.',
        );
      }

      const reporter = await tx.user.findUnique({
        where: { id: reportedById },
        select: { id: true, deletedAt: true },
      });

      if (!reporter || reporter.deletedAt) {
        throw new NotFoundException('Utilisateur declarant introuvable.');
      }

      const createdTicket = await tx.maintenanceTicket.create({
        data: {
          resourceId: createMaintenanceTicketDto.resourceId,
          reportedById,
          description,
          priority: createMaintenanceTicketDto.priority,
          status: MaintenanceTicketStatus.OPEN,
        },
      });

      await tx.resource.update({
        where: { id: createMaintenanceTicketDto.resourceId },
        data: { status: ResourceStatus.UNDER_MAINTENANCE },
      });

      return createdTicket;
    });

    return this.toMaintenanceTicketResponse(ticket);
  }

  async createMaintenanceReport(
    maintenanceTicketId: string,
    createMaintenanceReportDto: CreateMaintenanceReportDto,
    authorId: string,
  ): Promise<MaintenanceReportResponseDto> {
    const diagnosis = createMaintenanceReportDto.diagnosis.trim();
    const probableCause = createMaintenanceReportDto.probableCause.trim();
    const recommendations =
      createMaintenanceReportDto.recommendations?.trim() || null;

    const report = await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceTicket.findUnique({
        where: { id: maintenanceTicketId },
        select: {
          id: true,
          status: true,
          report: { select: { id: true } },
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket de maintenance introuvable.');
      }

      if (
        ticket.status !== MaintenanceTicketStatus.OPEN &&
        ticket.status !== MaintenanceTicketStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Seul un ticket ouvert ou en cours peut recevoir un constat.',
        );
      }

      if (ticket.report) {
        throw new ConflictException(
          'Un constat existe deja pour ce ticket de maintenance.',
        );
      }

      const author = await tx.user.findUnique({
        where: { id: authorId },
        select: { id: true, deletedAt: true },
      });

      if (!author || author.deletedAt) {
        throw new NotFoundException('Auteur du constat introuvable.');
      }

      return tx.maintenanceReport.create({
        data: {
          maintenanceTicketId,
          authorId,
          diagnosis,
          probableCause,
          severity: createMaintenanceReportDto.severity,
          recommendations,
        },
        include: maintenanceReportInclude,
      });
    });

    return this.toMaintenanceReportResponse(report);
  }

  async createMaintenanceIntervention(
    maintenanceTicketId: string,
    createMaintenanceInterventionDto: CreateMaintenanceInterventionDto,
  ): Promise<MaintenanceInterventionResponseDto> {
    const technicianName = createMaintenanceInterventionDto.technicianName.trim();
    const description = createMaintenanceInterventionDto.description.trim();
    const startedAt = new Date(createMaintenanceInterventionDto.startedAt);
    const completedAt = createMaintenanceInterventionDto.completedAt
      ? new Date(createMaintenanceInterventionDto.completedAt)
      : null;
    const cost =
      createMaintenanceInterventionDto.cost !== undefined
        ? new Prisma.Decimal(createMaintenanceInterventionDto.cost)
        : null;
    const result = createMaintenanceInterventionDto.result?.trim() || null;

    if (completedAt && completedAt < startedAt) {
      throw new BadRequestException(
        'La date de fin ne peut pas etre anterieure a la date de debut.',
      );
    }

    const intervention = await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceTicket.findUnique({
        where: { id: maintenanceTicketId },
        select: {
          id: true,
          status: true,
          report: { select: { id: true } },
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket de maintenance introuvable.');
      }

      if (!ticket.report) {
        throw new BadRequestException(
          'Un constat est obligatoire avant de creer une intervention.',
        );
      }

      if (
        ticket.status !== MaintenanceTicketStatus.OPEN &&
        ticket.status !== MaintenanceTicketStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Seul un ticket ouvert ou en cours peut recevoir une intervention.',
        );
      }

      const activeIntervention = await tx.maintenanceIntervention.findFirst({
        where: {
          maintenanceTicketId,
          completedAt: null,
        },
        select: { id: true },
      });

      if (activeIntervention) {
        throw new ConflictException(
          'Une intervention active existe deja pour ce ticket de maintenance.',
        );
      }

      const createdIntervention = await tx.maintenanceIntervention.create({
        data: {
          maintenanceTicketId,
          technicianName,
          description,
          startedAt,
          completedAt,
          cost,
          result,
        },
      });

      await tx.maintenanceTicket.update({
        where: { id: maintenanceTicketId },
        data: { status: MaintenanceTicketStatus.IN_PROGRESS },
      });

      return tx.maintenanceIntervention.findUniqueOrThrow({
        where: { id: createdIntervention.id },
        include: maintenanceInterventionInclude,
      });
    });

    return this.toMaintenanceInterventionResponse(intervention);
  }

  async createSupplierReturn(
    maintenanceTicketId: string,
    createSupplierReturnDto: CreateSupplierReturnDto,
  ): Promise<SupplierReturnResponseDto> {
    const reason = createSupplierReturnDto.reason.trim();
    const sentAt = new Date(createSupplierReturnDto.sentAt);
    const expectedReturnAt = createSupplierReturnDto.expectedReturnAt
      ? new Date(createSupplierReturnDto.expectedReturnAt)
      : null;
    const comment = createSupplierReturnDto.comment?.trim() || null;

    if (expectedReturnAt && expectedReturnAt < sentAt) {
      throw new BadRequestException(
        'La date de retour prevue ne peut pas etre anterieure a la date d envoi.',
      );
    }

    const supplierReturn = await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceTicket.findUnique({
        where: { id: maintenanceTicketId },
        select: {
          id: true,
          status: true,
          report: { select: { id: true } },
          interventions: { select: { id: true }, take: 1 },
          resource: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket de maintenance introuvable.');
      }

      if (!ticket.report) {
        throw new BadRequestException(
          'Un constat est obligatoire avant de creer un retour fournisseur.',
        );
      }

      if (ticket.interventions.length === 0) {
        throw new BadRequestException(
          'Une intervention est obligatoire avant de creer un retour fournisseur.',
        );
      }

      if (
        ticket.status !== MaintenanceTicketStatus.OPEN &&
        ticket.status !== MaintenanceTicketStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Seul un ticket ouvert ou en cours peut recevoir un retour fournisseur.',
        );
      }

      if (ticket.resource.status !== ResourceStatus.UNDER_MAINTENANCE) {
        throw new BadRequestException(
          'La ressource doit etre en maintenance pour un retour fournisseur.',
        );
      }

      const supplier = await tx.supplier.findUnique({
        where: { id: createSupplierReturnDto.supplierId },
        select: { id: true, status: true },
      });

      if (!supplier) {
        throw new NotFoundException('Fournisseur introuvable.');
      }

      if (supplier.status !== SupplierStatus.ACTIVE) {
        throw new BadRequestException(
          'Le fournisseur doit etre actif pour recevoir un retour.',
        );
      }

      const activeSupplierReturn = await tx.supplierReturn.findFirst({
        where: {
          maintenanceTicketId,
          status: { in: ACTIVE_SUPPLIER_RETURN_STATUSES },
        },
        select: { id: true },
      });

      if (activeSupplierReturn) {
        throw new ConflictException(
          'Un retour fournisseur actif existe deja pour ce ticket.',
        );
      }

      return tx.supplierReturn.create({
        data: {
          maintenanceTicketId,
          resourceId: ticket.resource.id,
          supplierId: createSupplierReturnDto.supplierId,
          reason,
          sentAt,
          expectedReturnAt,
          status: SupplierReturnStatus.SENT_TO_SUPPLIER,
          comment,
        },
        include: supplierReturnInclude,
      });
    });

    return this.toSupplierReturnResponse(supplierReturn);
  }

  private toMaintenanceTicketResponse(
    ticket: MaintenanceTicket,
  ): MaintenanceTicketResponseDto {
    return {
      id: ticket.id,
      resourceId: ticket.resourceId,
      reportedById: ticket.reportedById,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      openedAt: ticket.openedAt.toISOString(),
      closedAt: ticket.closedAt?.toISOString() ?? null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  private toMaintenanceReportResponse(
    report: MaintenanceReportWithRelations,
  ): MaintenanceReportResponseDto {
    return {
      id: report.id,
      diagnosis: report.diagnosis,
      probableCause: report.probableCause,
      severity: report.severity,
      recommendations: report.recommendations,
      reportedAt: report.reportedAt.toISOString(),
      author: {
        id: report.author.id,
        firstName: report.author.firstName,
        lastName: report.author.lastName,
        email: report.author.email,
      },
      maintenanceTicket: {
        id: report.maintenanceTicket.id,
        status: report.maintenanceTicket.status,
        priority: report.maintenanceTicket.priority,
        openedAt: report.maintenanceTicket.openedAt.toISOString(),
      },
    };
  }

  private toMaintenanceInterventionResponse(
    intervention: MaintenanceInterventionWithRelations,
  ): MaintenanceInterventionResponseDto {
    return {
      id: intervention.id,
      maintenanceTicketId: intervention.maintenanceTicketId,
      technicianName: intervention.technicianName,
      description: intervention.description,
      startedAt: intervention.startedAt.toISOString(),
      completedAt: intervention.completedAt?.toISOString() ?? null,
      cost: intervention.cost?.toString() ?? null,
      result: intervention.result,
      createdAt: intervention.createdAt.toISOString(),
      updatedAt: intervention.updatedAt.toISOString(),
      maintenanceTicket: {
        id: intervention.maintenanceTicket.id,
        status: intervention.maintenanceTicket.status,
        priority: intervention.maintenanceTicket.priority,
        openedAt: intervention.maintenanceTicket.openedAt.toISOString(),
      },
    };
  }

  private toSupplierReturnResponse(
    supplierReturn: SupplierReturnWithRelations,
  ): SupplierReturnResponseDto {
    return {
      id: supplierReturn.id,
      maintenanceTicketId: supplierReturn.maintenanceTicketId,
      resourceId: supplierReturn.resourceId,
      supplierId: supplierReturn.supplierId,
      reason: supplierReturn.reason,
      sentAt: supplierReturn.sentAt.toISOString(),
      expectedReturnAt: supplierReturn.expectedReturnAt?.toISOString() ?? null,
      actualReturnAt: supplierReturn.actualReturnAt?.toISOString() ?? null,
      status: supplierReturn.status,
      comment: supplierReturn.comment,
      createdAt: supplierReturn.createdAt.toISOString(),
      updatedAt: supplierReturn.updatedAt.toISOString(),
      maintenanceTicket: {
        id: supplierReturn.maintenanceTicket.id,
        status: supplierReturn.maintenanceTicket.status,
        priority: supplierReturn.maintenanceTicket.priority,
        openedAt: supplierReturn.maintenanceTicket.openedAt.toISOString(),
      },
      resource: {
        id: supplierReturn.resource.id,
        inventoryCode: supplierReturn.resource.inventoryCode,
        name: supplierReturn.resource.name,
        status: supplierReturn.resource.status,
      },
      supplier: {
        id: supplierReturn.supplier.id,
        name: supplierReturn.supplier.name,
        contactEmail: supplierReturn.supplier.contactEmail,
        status: supplierReturn.supplier.status,
      },
    };
  }
}
