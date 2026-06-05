import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Supplier, SupplierStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { SupplierHistoryResponseDto } from './dto/supplier-history-response.dto';
import { SupplierListResponseDto } from './dto/supplier-list-response.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async listSuppliers(query: ListSuppliersQueryDto): Promise<SupplierListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const where: Prisma.SupplierWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                contactEmail: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [total, suppliers] = await Promise.all([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: suppliers.map((supplier) => this.toSupplierResponse(supplier)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createSupplier(
    createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierResponseDto> {
    const name = createSupplierDto.name.trim();
    const contactEmail = createSupplierDto.contactEmail?.trim().toLowerCase() || null;
    const phone = createSupplierDto.phone?.trim() || null;
    const address = createSupplierDto.address?.trim() || null;

    const duplicateConditions: Prisma.SupplierWhereInput[] = [
      {
        name: {
          equals: name,
          mode: 'insensitive' as const,
        },
      },
    ];

    if (contactEmail) {
      duplicateConditions.push({
        contactEmail: {
          equals: contactEmail,
          mode: 'insensitive' as const,
        },
      });
    }

    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        OR: duplicateConditions,
      },
      select: { id: true },
    });

    if (existingSupplier) {
      throw new ConflictException('Un fournisseur avec ce nom ou cet email existe deja.');
    }

    const createdSupplier = await this.prisma.supplier.create({
      data: {
        name,
        contactEmail,
        phone,
        address,
        status: SupplierStatus.ACTIVE,
      },
    });

    return this.toSupplierResponse(createdSupplier);
  }

  async getSupplierById(supplierId: string): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    return this.toSupplierResponse(supplier);
  }

  async getSupplierHistory(supplierId: string): Promise<SupplierHistoryResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    return {
      supplierIdentity: {
        id: supplier.id,
        name: supplier.name,
        contactEmail: supplier.contactEmail,
        phone: supplier.phone,
        address: supplier.address,
      },
      supplierStatus: supplier.status,
      supplierCreatedAt: supplier.createdAt.toISOString(),
      supplierUpdatedAt: supplier.updatedAt.toISOString(),
      offersCount: 0,
      tendersCount: 0,
      maintenanceReturnsCount: 0,
    };
  }

  async deactivateSupplier(supplierId: string): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    const deactivatedSupplier = await this.prisma.supplier.update({
      where: { id: supplierId },
      data: { status: SupplierStatus.INACTIVE },
    });

    return this.toSupplierResponse(deactivatedSupplier);
  }

  private toSupplierResponse(supplier: Supplier): SupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      contactEmail: supplier.contactEmail,
      phone: supplier.phone,
      address: supplier.address,
      status: supplier.status,
      createdAt: supplier.createdAt.toISOString(),
    };
  }
}
