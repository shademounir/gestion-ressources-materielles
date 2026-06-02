import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Supplier, SupplierStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

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
