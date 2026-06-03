import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  Resource,
  ResourceStatus,
  SupplierStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import {
  ListResourcesQueryDto,
  ResourceCreatedAtSort,
} from './dto/list-resources-query.dto';
import { ResourceDetailResponseDto } from './dto/resource-detail-response.dto';
import {
  ResourceListItemResponseDto,
  ResourceListResponseDto,
} from './dto/resource-list-response.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { UpdateResourceStatusDto } from './dto/update-resource-status.dto';

const RESOURCE_DEFAULT_PAGE = 1;
const RESOURCE_DEFAULT_LIMIT = 20;
const RESOURCE_MAX_LIMIT = 100;

const resourceDetailInclude = {
  supplier: {
    select: {
      id: true,
      name: true,
      contactEmail: true,
      phone: true,
      status: true,
    },
  },
} satisfies Prisma.ResourceInclude;

type ResourceWithSupplier = Resource & {
  supplier: {
    id: string;
    name: string;
    contactEmail: string | null;
    phone: string | null;
    status: SupplierStatus;
  } | null;
};

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async createResource(
    createResourceDto: CreateResourceDto,
  ): Promise<ResourceResponseDto> {
    const name = createResourceDto.name.trim();
    const inventoryCode = createResourceDto.inventoryCode.trim();
    const category = createResourceDto.category.trim();
    const description = createResourceDto.description?.trim() || null;
    const serialNumber = createResourceDto.serialNumber?.trim() || null;
    const supplierId = createResourceDto.supplierId ?? null;

    const existingResource = await this.prisma.resource.findUnique({
      where: { inventoryCode },
      select: { id: true },
    });

    if (existingResource) {
      throw new ConflictException(
        'Une ressource avec cette reference inventaire existe deja.',
      );
    }

    if (supplierId) {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: { id: supplierId },
        select: { id: true },
      });

      if (!existingSupplier) {
        throw new NotFoundException('Fournisseur introuvable.');
      }
    }

    const createdResource = await this.prisma.resource.create({
      data: {
        name,
        inventoryCode,
        category,
        description,
        serialNumber,
        acquisitionDate: createResourceDto.acquisitionDate
          ? new Date(createResourceDto.acquisitionDate)
          : null,
        acquisitionValue:
          createResourceDto.acquisitionValue !== undefined
            ? new Prisma.Decimal(createResourceDto.acquisitionValue)
            : null,
        status: ResourceStatus.AVAILABLE,
        supplierId,
      },
    });

    return this.toResourceResponse(createdResource);
  }

  async listResources(
    query: ListResourcesQueryDto,
  ): Promise<ResourceListResponseDto> {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const skip = (page - 1) * limit;
    const where = this.buildResourceWhere(query);
    const orderBy: Prisma.ResourceOrderByWithRelationInput = {
      createdAt: query.createdAtSort ?? ResourceCreatedAtSort.DESC,
    };

    const [total, resources] = await Promise.all([
      this.prisma.resource.count({ where }),
      this.prisma.resource.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          inventoryCode: true,
          name: true,
          category: true,
          status: true,
          supplierId: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: resources.map((resource) => this.toResourceListItemResponse(resource)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getResourceById(resourceId: string): Promise<ResourceDetailResponseDto> {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: resourceDetailInclude,
    });

    if (!resource) {
      throw new NotFoundException('Ressource introuvable.');
    }

    return this.toResourceDetailResponse(resource);
  }

  async updateResourceStatus(
    resourceId: string,
    updateResourceStatusDto: UpdateResourceStatusDto,
  ): Promise<ResourceDetailResponseDto> {
    const existingResource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!existingResource) {
      throw new NotFoundException('Ressource introuvable.');
    }

    const updatedResource = await this.prisma.resource.update({
      where: { id: resourceId },
      data: this.buildStatusUpdateData(updateResourceStatusDto.status),
      include: resourceDetailInclude,
    });

    return this.toResourceDetailResponse(updatedResource);
  }

  private toResourceResponse(resource: Resource): ResourceResponseDto {
    return {
      id: resource.id,
      name: resource.name,
      inventoryCode: resource.inventoryCode,
      category: resource.category,
      description: resource.description,
      serialNumber: resource.serialNumber,
      acquisitionDate: resource.acquisitionDate?.toISOString() ?? null,
      acquisitionValue: resource.acquisitionValue?.toString() ?? null,
      status: resource.status,
      supplierId: resource.supplierId,
      createdAt: resource.createdAt.toISOString(),
    };
  }

  private buildResourceWhere(
    query: ListResourcesQueryDto,
  ): Prisma.ResourceWhereInput {
    const where: Prisma.ResourceWhereInput = {};
    const name = query.name?.trim();
    const inventoryCode = query.inventoryCode?.trim();
    const category = query.category?.trim();

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (inventoryCode) {
      where.inventoryCode = {
        contains: inventoryCode,
        mode: 'insensitive',
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private normalizePage(page?: number): number {
    return page && page > 0 ? page : RESOURCE_DEFAULT_PAGE;
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || limit < 1) {
      return RESOURCE_DEFAULT_LIMIT;
    }

    return Math.min(limit, RESOURCE_MAX_LIMIT);
  }

  private buildStatusUpdateData(
    status: ResourceStatus,
  ): Prisma.ResourceUpdateInput {
    return {
      status,
    };
  }

  private toResourceListItemResponse(resource: {
    id: string;
    inventoryCode: string;
    name: string;
    category: string;
    status: ResourceStatus;
    supplierId: string | null;
    createdAt: Date;
  }): ResourceListItemResponseDto {
    return {
      id: resource.id,
      inventoryCode: resource.inventoryCode,
      name: resource.name,
      category: resource.category,
      status: resource.status,
      supplierId: resource.supplierId,
      createdAt: resource.createdAt.toISOString(),
    };
  }

  private toResourceDetailResponse(
    resource: ResourceWithSupplier,
  ): ResourceDetailResponseDto {
    return {
      id: resource.id,
      name: resource.name,
      inventoryCode: resource.inventoryCode,
      category: resource.category,
      description: resource.description,
      serialNumber: resource.serialNumber,
      acquisitionDate: resource.acquisitionDate?.toISOString() ?? null,
      acquisitionValue: resource.acquisitionValue?.toString() ?? null,
      status: resource.status,
      supplierId: resource.supplierId,
      supplier: resource.supplier
        ? {
            id: resource.supplier.id,
            name: resource.supplier.name,
            contactEmail: resource.supplier.contactEmail,
            phone: resource.supplier.phone,
            status: resource.supplier.status,
          }
        : null,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    };
  }
}
