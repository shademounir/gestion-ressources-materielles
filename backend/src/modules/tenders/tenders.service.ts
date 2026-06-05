import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Tender, TenderStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { ListTendersQueryDto } from './dto/list-tenders-query.dto';
import { TenderDetailResponseDto } from './dto/tender-detail-response.dto';
import {
  TenderListItemResponseDto,
  TenderListResponseDto,
} from './dto/tender-list-response.dto';
import { TenderResponseDto } from './dto/tender-response.dto';

type TenderDetailRecord = Prisma.TenderGetPayload<{
  include: {
    need: {
      select: {
        id: true;
        title: true;
        priority: true;
        status: true;
        departmentId: true;
        createdById: true;
        createdAt: true;
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
    offers: {
      include: {
        supplier: {
          select: {
            id: true;
            name: true;
            contactEmail: true;
            status: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class TendersService {
  constructor(private readonly prisma: PrismaService) {}

  async listTenders(query: ListTendersQueryDto): Promise<TenderListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const where: Prisma.TenderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              {
                reference: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                title: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [total, tenders] = await Promise.all([
      this.prisma.tender.count({ where }),
      this.prisma.tender.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: tenders.map((tender) => this.toTenderListItemResponse(tender)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createTender(
    createTenderDto: CreateTenderDto,
    createdById: string,
  ): Promise<TenderResponseDto> {
    const deadline = new Date(createTenderDto.deadline);

    if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
      throw new BadRequestException('La date limite doit etre future.');
    }

    const need = await this.prisma.need.findUnique({
      where: { id: createTenderDto.needId },
      select: { id: true },
    });

    if (!need) {
      throw new NotFoundException('Besoin introuvable.');
    }

    const activeTender = await this.prisma.tender.findFirst({
      where: {
        needId: createTenderDto.needId,
        status: {
          notIn: [TenderStatus.CANCELLED, TenderStatus.ARCHIVED],
        },
      },
      select: { id: true },
    });

    if (activeTender) {
      throw new ConflictException('Un appel d offres actif existe deja pour ce besoin.');
    }

    const reference = await this.resolveTenderReference(createTenderDto.reference);
    const tender = await this.prisma.tender.create({
      data: {
        reference,
        title: createTenderDto.title.trim(),
        description: createTenderDto.description.trim(),
        status: TenderStatus.DRAFT,
        deadline,
        needId: createTenderDto.needId,
        createdById,
      },
    });

    return this.toTenderResponse(tender);
  }

  async getTenderById(tenderId: string): Promise<TenderDetailResponseDto> {
    const tender = await this.prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        need: {
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
            departmentId: true,
            createdById: true,
            createdAt: true,
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
        offers: {
          orderBy: { submittedAt: 'desc' },
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                contactEmail: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!tender) {
      throw new NotFoundException('Appel d offres introuvable.');
    }

    return this.toTenderDetailResponse(tender);
  }

  async publishTender(tenderId: string): Promise<TenderResponseDto> {
    const tender = await this.prisma.tender.findUnique({
      where: { id: tenderId },
    });

    if (!tender) {
      throw new NotFoundException('Appel d offres introuvable.');
    }

    if (tender.status !== TenderStatus.DRAFT) {
      throw new BadRequestException(
        'Seul un appel d offres en brouillon peut etre publie.',
      );
    }

    if (tender.deadline <= new Date()) {
      throw new BadRequestException(
        'La date limite doit etre future pour publier l appel d offres.',
      );
    }

    const publishedTender = await this.prisma.tender.update({
      where: { id: tenderId },
      data: {
        status: TenderStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return this.toTenderResponse(publishedTender);
  }

  private async resolveTenderReference(reference?: string): Promise<string> {
    if (reference) {
      const normalizedReference = reference.trim().toUpperCase();
      const existingTender = await this.prisma.tender.findUnique({
        where: { reference: normalizedReference },
        select: { id: true },
      });

      if (existingTender) {
        throw new ConflictException('Reference appel d offres deja utilisee.');
      }

      return normalizedReference;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const generatedReference = this.generateTenderReference();
      const existingTender = await this.prisma.tender.findUnique({
        where: { reference: generatedReference },
        select: { id: true },
      });

      if (!existingTender) {
        return generatedReference;
      }
    }

    throw new ConflictException('Impossible de generer une reference unique.');
  }

  private generateTenderReference(): string {
    const currentDate = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const suffix = randomUUID().slice(0, 8).toUpperCase();

    return `AO-${currentDate}-${suffix}`;
  }

  private toTenderListItemResponse(tender: Tender): TenderListItemResponseDto {
    return {
      id: tender.id,
      reference: tender.reference,
      title: tender.title,
      status: tender.status,
      deadline: tender.deadline.toISOString(),
      publishedAt: tender.publishedAt?.toISOString() ?? null,
      awardedAt: tender.awardedAt?.toISOString() ?? null,
      needId: tender.needId,
      createdById: tender.createdById,
      createdAt: tender.createdAt.toISOString(),
      updatedAt: tender.updatedAt.toISOString(),
    };
  }

  private toTenderDetailResponse(tender: TenderDetailRecord): TenderDetailResponseDto {
    return {
      ...this.toTenderResponse(tender),
      need: {
        id: tender.need.id,
        title: tender.need.title,
        priority: tender.need.priority,
        status: tender.need.status,
        departmentId: tender.need.departmentId,
        createdById: tender.need.createdById,
        createdAt: tender.need.createdAt.toISOString(),
      },
      createdBy: {
        id: tender.createdBy.id,
        firstName: tender.createdBy.firstName,
        lastName: tender.createdBy.lastName,
        email: tender.createdBy.email,
      },
      offers: tender.offers.map((offer) => ({
        id: offer.id,
        tenderId: offer.tenderId,
        supplierId: offer.supplierId,
        amount: Number(offer.amount),
        proposedDeliveryDays: offer.proposedDeliveryDays,
        comment: offer.comment,
        status: offer.status,
        submittedAt: offer.submittedAt.toISOString(),
        selectedAt: offer.selectedAt?.toISOString() ?? null,
        createdAt: offer.createdAt.toISOString(),
        updatedAt: offer.updatedAt.toISOString(),
        supplier: {
          id: offer.supplier.id,
          name: offer.supplier.name,
          contactEmail: offer.supplier.contactEmail,
          status: offer.supplier.status,
        },
      })),
    };
  }

  private toTenderResponse(tender: Tender): TenderResponseDto {
    return {
      id: tender.id,
      reference: tender.reference,
      title: tender.title,
      description: tender.description,
      status: tender.status,
      deadline: tender.deadline.toISOString(),
      publishedAt: tender.publishedAt?.toISOString() ?? null,
      awardedAt: tender.awardedAt?.toISOString() ?? null,
      needId: tender.needId,
      createdById: tender.createdById,
      createdAt: tender.createdAt.toISOString(),
      updatedAt: tender.updatedAt.toISOString(),
    };
  }
}
