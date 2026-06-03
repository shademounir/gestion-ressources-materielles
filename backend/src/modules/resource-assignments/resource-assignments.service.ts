import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ResourceAssignment,
  ResourceAssignmentStatus,
  ResourceStatus,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateResourceAssignmentDto } from './dto/create-resource-assignment.dto';
import { ResourceAssignmentResponseDto } from './dto/resource-assignment-response.dto';
import { ReturnResourceAssignmentDto } from './dto/return-resource-assignment.dto';

@Injectable()
export class ResourceAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignResource(
    createResourceAssignmentDto: CreateResourceAssignmentDto,
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

      return createdAssignment;
    });

    return this.toResourceAssignmentResponse(assignment);
  }

  async returnResource(
    assignmentId: string,
    returnResourceAssignmentDto: ReturnResourceAssignmentDto,
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

      return returnedAssignment;
    });

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
}
