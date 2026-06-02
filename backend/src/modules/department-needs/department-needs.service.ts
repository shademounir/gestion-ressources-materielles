import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Need, NeedItem, NeedStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDepartmentNeedDto } from './dto/create-department-need.dto';
import { DepartmentNeedResponseDto } from './dto/department-need-response.dto';

type NeedWithItems = Need & {
  items: NeedItem[];
};

@Injectable()
export class DepartmentNeedsService {
  constructor(private readonly prisma: PrismaService) {}

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
