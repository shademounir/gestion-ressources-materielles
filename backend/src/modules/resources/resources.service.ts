import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Resource, ResourceStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';

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
}
