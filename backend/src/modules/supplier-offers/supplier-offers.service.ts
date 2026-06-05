import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SupplierOffer,
  SupplierOfferStatus,
  SupplierStatus,
  TenderStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSupplierOfferDto } from './dto/create-supplier-offer.dto';
import { ListSupplierOffersQueryDto } from './dto/list-supplier-offers-query.dto';
import {
  SupplierOfferDetailResponseDto,
  SupplierOfferListResponseDto,
} from './dto/supplier-offer-read-response.dto';
import { SupplierOfferResponseDto } from './dto/supplier-offer-response.dto';

type SupplierOfferDetailRecord = Prisma.SupplierOfferGetPayload<{
  include: {
    tender: {
      select: {
        id: true;
        reference: true;
        title: true;
        status: true;
        deadline: true;
      };
    };
    supplier: {
      select: {
        id: true;
        name: true;
        contactEmail: true;
        phone: true;
        status: true;
      };
    };
  };
}>;

@Injectable()
export class SupplierOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async listSupplierOffers(
    query: ListSupplierOffersQueryDto,
  ): Promise<SupplierOfferListResponseDto> {
    return this.listSupplierOffersByWhere({
      page: query.page,
      limit: query.limit,
      where: {
        ...(query.tenderId ? { tenderId: query.tenderId } : {}),
        ...(query.supplierId ? { supplierId: query.supplierId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    });
  }

  async listSupplierOffersForTender(
    tenderId: string,
    query: ListSupplierOffersQueryDto,
  ): Promise<SupplierOfferListResponseDto> {
    return this.listSupplierOffersByWhere({
      page: query.page,
      limit: query.limit,
      where: {
        tenderId,
        ...(query.supplierId ? { supplierId: query.supplierId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    });
  }

  async createSupplierOffer(
    createSupplierOfferDto: CreateSupplierOfferDto,
  ): Promise<SupplierOfferResponseDto> {
    const tender = await this.prisma.tender.findUnique({
      where: { id: createSupplierOfferDto.tenderId },
      select: { id: true, status: true, deadline: true },
    });

    if (!tender) {
      throw new NotFoundException('Appel d offres introuvable.');
    }

    if (tender.status !== TenderStatus.PUBLISHED) {
      throw new BadRequestException('Seul un appel d offres publie peut recevoir une offre.');
    }

    if (tender.deadline <= new Date()) {
      throw new BadRequestException('Appel d offres expire.');
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createSupplierOfferDto.supplierId },
      select: { id: true, status: true },
    });

    if (!supplier) {
      throw new NotFoundException('Fournisseur introuvable.');
    }

    if (supplier.status !== SupplierStatus.ACTIVE) {
      throw new BadRequestException('Le fournisseur doit etre actif pour deposer une offre.');
    }

    const existingOffer = await this.prisma.supplierOffer.findUnique({
      where: {
        tenderId_supplierId: {
          tenderId: createSupplierOfferDto.tenderId,
          supplierId: createSupplierOfferDto.supplierId,
        },
      },
      select: { id: true },
    });

    if (existingOffer) {
      throw new ConflictException('Une offre existe deja pour ce fournisseur et cet appel d offres.');
    }

    const supplierOffer = await this.prisma.supplierOffer.create({
      data: {
        tenderId: createSupplierOfferDto.tenderId,
        supplierId: createSupplierOfferDto.supplierId,
        amount: createSupplierOfferDto.amount,
        proposedDeliveryDays: createSupplierOfferDto.proposedDeliveryDays,
        comment: createSupplierOfferDto.comment?.trim() || null,
        status: SupplierOfferStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    return this.toSupplierOfferResponse(supplierOffer);
  }

  async getSupplierOfferById(
    supplierOfferId: string,
  ): Promise<SupplierOfferDetailResponseDto> {
    const supplierOffer = await this.prisma.supplierOffer.findUnique({
      where: { id: supplierOfferId },
      include: {
        tender: {
          select: {
            id: true,
            reference: true,
            title: true,
            status: true,
            deadline: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!supplierOffer) {
      throw new NotFoundException('Offre fournisseur introuvable.');
    }

    return this.toSupplierOfferDetailResponse(supplierOffer);
  }

  async selectSupplierOffer(supplierOfferId: string): Promise<SupplierOfferResponseDto> {
    const selectedOffer = await this.prisma.$transaction(async (tx) => {
      const supplierOffer = await tx.supplierOffer.findUnique({
        where: { id: supplierOfferId },
        include: {
          tender: {
            select: { id: true, status: true },
          },
        },
      });

      if (!supplierOffer) {
        throw new NotFoundException('Offre fournisseur introuvable.');
      }

      if (
        supplierOffer.status !== SupplierOfferStatus.SUBMITTED &&
        supplierOffer.status !== SupplierOfferStatus.UNDER_REVIEW
      ) {
        throw new BadRequestException(
          'Seule une offre soumise ou en cours de revue peut etre selectionnee.',
        );
      }

      if (supplierOffer.tender.status !== TenderStatus.PUBLISHED) {
        throw new BadRequestException(
          'Seul un appel d offres publie peut avoir une offre selectionnee.',
        );
      }

      const existingSelectedOffer = await tx.supplierOffer.findFirst({
        where: {
          tenderId: supplierOffer.tenderId,
          status: SupplierOfferStatus.SELECTED,
        },
        select: { id: true },
      });

      if (existingSelectedOffer) {
        throw new ConflictException(
          'Une offre gagnante existe deja pour cet appel d offres.',
        );
      }

      await tx.supplierOffer.updateMany({
        where: {
          tenderId: supplierOffer.tenderId,
          id: { not: supplierOffer.id },
        },
        data: {
          status: SupplierOfferStatus.REJECTED,
        },
      });

      const selectionDate = new Date();
      const updatedSupplierOffer = await tx.supplierOffer.update({
        where: { id: supplierOffer.id },
        data: {
          status: SupplierOfferStatus.SELECTED,
          selectedAt: selectionDate,
        },
      });

      await tx.tender.update({
        where: { id: supplierOffer.tenderId },
        data: {
          status: TenderStatus.AWARDED,
          awardedAt: selectionDate,
        },
      });

      return updatedSupplierOffer;
    });

    return this.toSupplierOfferResponse(selectedOffer);
  }

  private async listSupplierOffersByWhere({
    page,
    limit,
    where,
  }: {
    page?: number;
    limit?: number;
    where: Prisma.SupplierOfferWhereInput;
  }): Promise<SupplierOfferListResponseDto> {
    const safePage = page ?? 1;
    const safeLimit = limit ?? 20;
    const [total, supplierOffers] = await Promise.all([
      this.prisma.supplierOffer.count({ where }),
      this.prisma.supplierOffer.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
    ]);

    return {
      data: supplierOffers.map((supplierOffer) =>
        this.toSupplierOfferResponse(supplierOffer),
      ),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  private toSupplierOfferDetailResponse(
    supplierOffer: SupplierOfferDetailRecord,
  ): SupplierOfferDetailResponseDto {
    return {
      ...this.toSupplierOfferResponse(supplierOffer),
      tender: {
        id: supplierOffer.tender.id,
        reference: supplierOffer.tender.reference,
        title: supplierOffer.tender.title,
        status: supplierOffer.tender.status,
        deadline: supplierOffer.tender.deadline.toISOString(),
      },
      supplier: {
        id: supplierOffer.supplier.id,
        name: supplierOffer.supplier.name,
        contactEmail: supplierOffer.supplier.contactEmail,
        phone: supplierOffer.supplier.phone,
        status: supplierOffer.supplier.status,
      },
    };
  }

  private toSupplierOfferResponse(
    supplierOffer: SupplierOffer,
  ): SupplierOfferResponseDto {
    return {
      id: supplierOffer.id,
      tenderId: supplierOffer.tenderId,
      supplierId: supplierOffer.supplierId,
      amount: Number(supplierOffer.amount),
      proposedDeliveryDays: supplierOffer.proposedDeliveryDays,
      comment: supplierOffer.comment,
      status: supplierOffer.status,
      submittedAt: supplierOffer.submittedAt.toISOString(),
      selectedAt: supplierOffer.selectedAt?.toISOString() ?? null,
      createdAt: supplierOffer.createdAt.toISOString(),
      updatedAt: supplierOffer.updatedAt.toISOString(),
    };
  }
}
