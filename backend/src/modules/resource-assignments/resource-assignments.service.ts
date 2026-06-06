import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ResourceAssignment,
  ResourceAssignmentStatus,
  ResourceStatus,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CountResponseDto } from '../../common/dto/count-response.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateResourceAssignmentDto } from './dto/create-resource-assignment.dto';
import { ListResourceAssignmentsQueryDto } from './dto/list-resource-assignments-query.dto';
import {
  ResourceAssignmentDetailDto,
  ResourceAssignmentHistoryItemDto,
  ResourceAssignmentHistoryResponseDto,
} from './dto/resource-assignment-read.dto';
import { ResourceAssignmentResponseDto } from './dto/resource-assignment-response.dto';
import { ReturnResourceAssignmentDto } from './dto/return-resource-assignment.dto';

const ASSIGNMENT_DEFAULT_PAGE = 1;
const ASSIGNMENT_DEFAULT_LIMIT = 20;
const ASSIGNMENT_MAX_LIMIT = 100;

const assignmentReadInclude = {
  resource: {
    select: {
      id: true,
      inventoryCode: true,
      name: true,
      category: true,
      status: true,
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} satisfies Prisma.ResourceAssignmentInclude;

type AssignmentWithReadRelations = ResourceAssignment & {
  resource: {
    id: string;
    inventoryCode: string;
    name: string;
    category: string;
    status: ResourceStatus;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

@Injectable()
export class ResourceAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async countActiveAssignments(): Promise<CountResponseDto> {
    const count = await this.prisma.resourceAssignment.count({
      where: { status: ResourceAssignmentStatus.ACTIVE },
    });

    return { count };
  }

  async listResourceAssignmentsByResource(
    resourceId: string,
    query: ListResourceAssignmentsQueryDto,
  ): Promise<ResourceAssignmentHistoryResponseDto> {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!resource) {
      throw new NotFoundException('Ressource introuvable.');
    }

    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const skip = (page - 1) * limit;
    const where: Prisma.ResourceAssignmentWhereInput = { resourceId };

    const [total, assignments] = await Promise.all([
      this.prisma.resourceAssignment.count({ where }),
      this.prisma.resourceAssignment.findMany({
        where,
        include: assignmentReadInclude,
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: assignments.map((assignment) =>
        this.toResourceAssignmentHistoryItem(assignment),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAssignmentById(
    assignmentId: string,
  ): Promise<ResourceAssignmentDetailDto> {
    const assignment = await this.prisma.resourceAssignment.findUnique({
      where: { id: assignmentId },
      include: assignmentReadInclude,
    });

    if (!assignment) {
      throw new NotFoundException('Affectation introuvable.');
    }

    return this.toResourceAssignmentDetail(assignment);
  }

  async assignResource(
    createResourceAssignmentDto: CreateResourceAssignmentDto,
    actorUserId?: string | null,
  ): Promise<ResourceAssignmentResponseDto> {
    const comment = createResourceAssignmentDto.comment?.trim() || null;

    const assignment = await this.prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: createResourceAssignmentDto.resourceId },
        select: { id: true, status: true },
      });

      if (!resource) {
        throw new NotFoundException('Ressource introuvable.');
      }

      if (resource.status !== ResourceStatus.AVAILABLE) {
        throw new BadRequestException(
          'Seule une ressource disponible peut etre affectee.',
        );
      }

      const user = await tx.user.findUnique({
        where: { id: createResourceAssignmentDto.userId },
        select: { id: true, status: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        throw new NotFoundException('Utilisateur introuvable.');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new BadRequestException(
          'Un utilisateur inactif ne peut pas recevoir une affectation.',
        );
      }

      const activeAssignment = await tx.resourceAssignment.findFirst({
        where: {
          resourceId: createResourceAssignmentDto.resourceId,
          status: ResourceAssignmentStatus.ACTIVE,
        },
        select: { id: true },
      });

      if (activeAssignment) {
        throw new ConflictException(
          'Cette ressource possede deja une affectation active.',
        );
      }

      const createdAssignment = await tx.resourceAssignment.create({
        data: {
          resourceId: createResourceAssignmentDto.resourceId,
          userId: createResourceAssignmentDto.userId,
          status: ResourceAssignmentStatus.ACTIVE,
          comment,
        },
      });

      await tx.resource.update({
        where: { id: createResourceAssignmentDto.resourceId },
        data: { status: ResourceStatus.ASSIGNED },
      });

      await this.notificationsService.notifyResourceAssigned(
        tx,
        createdAssignment.id,
        createdAssignment.userId,
      );

      return createdAssignment;
    });

    await this.auditLogsService.logResourceAssigned(
      assignment.id,
      actorUserId,
    );

    return this.toResourceAssignmentResponse(assignment);
  }

  async returnResource(
    assignmentId: string,
    returnResourceAssignmentDto: ReturnResourceAssignmentDto,
    actorUserId?: string | null,
  ): Promise<ResourceAssignmentResponseDto> {
    const returnComment =
      returnResourceAssignmentDto.returnComment?.trim() || null;

    const assignment = await this.prisma.$transaction(async (tx) => {
      const existingAssignment = await tx.resourceAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          resource: {
            select: { id: true, status: true },
          },
        },
      });

      if (!existingAssignment) {
        throw new NotFoundException('Affectation introuvable.');
      }

      if (!existingAssignment.resource) {
        throw new NotFoundException('Ressource introuvable.');
      }

      if (existingAssignment.status !== ResourceAssignmentStatus.ACTIVE) {
        throw new BadRequestException(
          'Seule une affectation active peut etre retournee.',
        );
      }

      if (existingAssignment.resource.status !== ResourceStatus.ASSIGNED) {
        throw new BadRequestException(
          'Seule une ressource affectee peut etre retournee.',
        );
      }

      const returnedAssignment = await tx.resourceAssignment.update({
        where: { id: assignmentId },
        data: {
          status: ResourceAssignmentStatus.RETURNED,
          returnedAt: new Date(),
          returnComment,
        },
      });

      await tx.resource.update({
        where: { id: existingAssignment.resourceId },
        data: { status: ResourceStatus.AVAILABLE },
      });

      await this.notificationsService.notifyResourceReturned(
        tx,
        returnedAssignment.id,
        returnedAssignment.userId,
      );

      return returnedAssignment;
    });

    await this.auditLogsService.logResourceReturned(
      assignment.id,
      actorUserId,
    );

    return this.toResourceAssignmentResponse(assignment);
  }

  private toResourceAssignmentResponse(
    assignment: ResourceAssignment,
  ): ResourceAssignmentResponseDto {
    return {
      id: assignment.id,
      resourceId: assignment.resourceId,
      userId: assignment.userId,
      assignedAt: assignment.assignedAt.toISOString(),
      returnedAt: assignment.returnedAt?.toISOString() ?? null,
      status: assignment.status,
      comment: assignment.comment,
      returnComment: assignment.returnComment,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
    };
  }

  private normalizePage(page?: number): number {
    return page && page > 0 ? page : ASSIGNMENT_DEFAULT_PAGE;
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return ASSIGNMENT_DEFAULT_LIMIT;
    }

    return Math.min(limit, ASSIGNMENT_MAX_LIMIT);
  }

  private toResourceAssignmentHistoryItem(
    assignment: AssignmentWithReadRelations,
  ): ResourceAssignmentHistoryItemDto {
    return {
      id: assignment.id,
      resourceId: assignment.resourceId,
      resourceName: assignment.resource.name,
      inventoryCode: assignment.resource.inventoryCode,
      userId: assignment.userId,
      userFullName: `${assignment.user.firstName} ${assignment.user.lastName}`,
      status: assignment.status,
      assignedAt: assignment.assignedAt.toISOString(),
      returnedAt: assignment.returnedAt?.toISOString() ?? null,
      comment: assignment.comment,
      returnComment: assignment.returnComment,
    };
  }

  private toResourceAssignmentDetail(
    assignment: AssignmentWithReadRelations,
  ): ResourceAssignmentDetailDto {
    return {
      id: assignment.id,
      status: assignment.status,
      assignedAt: assignment.assignedAt.toISOString(),
      returnedAt: assignment.returnedAt?.toISOString() ?? null,
      comment: assignment.comment,
      returnComment: assignment.returnComment,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
      resource: {
        id: assignment.resource.id,
        inventoryCode: assignment.resource.inventoryCode,
        name: assignment.resource.name,
        category: assignment.resource.category,
        status: assignment.resource.status,
      },
      user: {
        id: assignment.user.id,
        firstName: assignment.user.firstName,
        lastName: assignment.user.lastName,
        email: assignment.user.email,
      },
    };
  }
}
