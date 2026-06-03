import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  MaintenanceTicket,
  MaintenanceTicketStatus,
  ResourceStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateMaintenanceTicketDto } from './dto/create-maintenance-ticket.dto';
import { MaintenanceTicketResponseDto } from './dto/maintenance-ticket-response.dto';

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
}
