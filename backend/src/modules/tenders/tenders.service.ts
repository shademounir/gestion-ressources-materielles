import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tender, TenderStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { TenderResponseDto } from './dto/tender-response.dto';

@Injectable()
export class TendersService {
  constructor(private readonly prisma: PrismaService) {}

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

  private toTenderResponse(tender: Tender): TenderResponseDto {
    return {
      id: tender.id,
      reference: tender.reference,
      title: tender.title,
      description: tender.description,
      status: tender.status,
      deadline: tender.deadline.toISOString(),
      needId: tender.needId,
      createdById: tender.createdById,
      createdAt: tender.createdAt.toISOString(),
      updatedAt: tender.updatedAt.toISOString(),
    };
  }
}
