import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Need, NeedItem, NeedStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDepartmentNeedDto } from './dto/create-department-need.dto';
import {
  DepartmentNeedDetailResponseDto,
  DepartmentNeedListItemResponseDto,
  DepartmentNeedListResponseDto,
} from './dto/department-need-read-response.dto';
import { DepartmentNeedResponseDto } from './dto/department-need-response.dto';
import { ListDepartmentNeedsQueryDto } from './dto/list-department-needs-query.dto';

type NeedWithItems = Need & {
  items: NeedItem[];
};

type NeedDetailRecord = Prisma.NeedGetPayload<{
  include: {
    items: true;
    department: {
      select: {
        id: true;
        name: true;
      };
    };
    createdBy: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;

@Injectable()
export class DepartmentNeedsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDepartmentNeeds(
    query: ListDepartmentNeedsQueryDto,
  ): Promise<DepartmentNeedListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NeedWhereInput = {
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };

    const [total, needs] = await Promise.all([
      this.prisma.need.count({ where }),
      this.prisma.need.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: needs.map((need) => this.toDepartmentNeedListItemResponse(need)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createDepartmentNeed(
    createDepartmentNeedDto: CreateDepartmentNeedDto,
    createdById: string,
  ): Promise<DepartmentNeedResponseDto> {
    if (createDepartmentNeedDto.items.length === 0) {
      throw new BadRequestException('Au moins une ligne de besoin est obligatoire.');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: createDepartmentNeedDto.departmentId },
      select: { id: true, deletedAt: true },
    });

    if (!department || department.deletedAt) {
      throw new NotFoundException('Departement introuvable.');
    }

    const createdBy = await this.prisma.user.findUnique({
      where: { id: createdById },
      select: { id: true, deletedAt: true },
    });

    if (!createdBy || createdBy.deletedAt) {
      throw new NotFoundException('Utilisateur createur introuvable.');
    }

    const need = await this.prisma.need.create({
      data: {
        title: createDepartmentNeedDto.title.trim(),
        justification: createDepartmentNeedDto.justification.trim(),
        priority: createDepartmentNeedDto.priority,
        status: NeedStatus.SUBMITTED,
        departmentId: createDepartmentNeedDto.departmentId,
        createdById,
        items: {
          create: createDepartmentNeedDto.items.map((item) => ({
            designation: item.designation.trim(),
            description: item.description?.trim() || null,
            quantity: item.quantity,
            estimatedUnitPrice: item.estimatedUnitPrice ?? null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.toDepartmentNeedResponse(need);
  }

  async getDepartmentNeedById(needId: string): Promise<DepartmentNeedDetailResponseDto> {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
      include: {
        items: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!need) {
      throw new NotFoundException('Besoin introuvable.');
    }

    return this.toDepartmentNeedDetailResponse(need);
  }

  private toDepartmentNeedListItemResponse(
    need: Need,
  ): DepartmentNeedListItemResponseDto {
    return {
      id: need.id,
      title: need.title,
      priority: need.priority,
      status: need.status,
      departmentId: need.departmentId,
      createdById: need.createdById,
      createdAt: need.createdAt.toISOString(),
      updatedAt: need.updatedAt.toISOString(),
    };
  }

  private toDepartmentNeedDetailResponse(
    need: NeedDetailRecord,
  ): DepartmentNeedDetailResponseDto {
    return {
      ...this.toDepartmentNeedResponse(need),
      department: {
        id: need.department.id,
        name: need.department.name,
      },
      createdBy: {
        id: need.createdBy.id,
        firstName: need.createdBy.firstName,
        lastName: need.createdBy.lastName,
        email: need.createdBy.email,
      },
    };
  }

  private toDepartmentNeedResponse(need: NeedWithItems): DepartmentNeedResponseDto {
    return {
      id: need.id,
      title: need.title,
      justification: need.justification,
      priority: need.priority,
      status: need.status,
      departmentId: need.departmentId,
      createdById: need.createdById,
      items: need.items.map((item) => ({
        id: item.id,
        designation: item.designation,
        description: item.description,
        quantity: item.quantity,
        estimatedUnitPrice:
          item.estimatedUnitPrice === null ? null : Number(item.estimatedUnitPrice),
        createdAt: item.createdAt.toISOString(),
      })),
      createdAt: need.createdAt.toISOString(),
      updatedAt: need.updatedAt.toISOString(),
    };
  }
}
