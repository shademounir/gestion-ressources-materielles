import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NeedPriority,
  NeedStatus,
  SupplierOfferStatus,
  SupplierStatus,
} from '@prisma/client';
import { TenderResponseDto } from './tender-response.dto';

export class TenderNeedResponseDto {
  @ApiProperty({ example: '2d891e20-3552-4ed6-8227-42fb698d7d2e' })
  id!: string;

  @ApiProperty({ example: 'Equipement salle informatique' })
  title!: string;

  @ApiProperty({ enum: NeedPriority, example: NeedPriority.HIGH })
  priority!: NeedPriority;

  @ApiProperty({ enum: NeedStatus, example: NeedStatus.SUBMITTED })
  status!: NeedStatus;

  @ApiProperty({ example: '5f875c98-6a66-44b4-92e7-f68b8ff99590' })
  departmentId!: string;

  @ApiProperty({ example: '3d15d575-fd17-446f-94f3-c5560e557f50' })
  createdById!: string;

  @ApiProperty({ example: '2026-06-02T10:00:00.000Z' })
  createdAt!: string;
}

export class TenderCreatorResponseDto {
  @ApiProperty({ example: '3d15d575-fd17-446f-94f3-c5560e557f50' })
  id!: string;

  @ApiProperty({ example: 'System' })
  firstName!: string;

  @ApiProperty({ example: 'Administrator' })
  lastName!: string;

  @ApiProperty({ example: 'admin@grm.local' })
  email!: string;
}

export class TenderOfferSupplierResponseDto {
  @ApiProperty({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  id!: string;

  @ApiProperty({ example: 'Tech Solutions Maroc' })
  name!: string;

  @ApiPropertyOptional({ example: 'contact@techsolutions.test', nullable: true })
  contactEmail!: string | null;

  @ApiProperty({ enum: SupplierStatus, example: SupplierStatus.ACTIVE })
  status!: SupplierStatus;
}

export class TenderOfferResponseDto {
  @ApiProperty({ example: '7d3402e2-fb11-4261-8e33-56e0ea5e9c5e' })
  id!: string;

  @ApiProperty({ example: '32746c41-d6b8-45f1-9354-ad769e6ba7f0' })
  tenderId!: string;

  @ApiProperty({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  supplierId!: string;

  @ApiProperty({ example: 125000 })
  amount!: number;

  @ApiProperty({ example: 30 })
  proposedDeliveryDays!: number;

  @ApiPropertyOptional({ example: 'Livraison possible en deux lots.', nullable: true })
  comment!: string | null;

  @ApiProperty({ enum: SupplierOfferStatus, example: SupplierOfferStatus.SUBMITTED })
  status!: SupplierOfferStatus;

  @ApiProperty({ example: '2026-06-02T14:00:00.000Z' })
  submittedAt!: string;

  @ApiPropertyOptional({ example: '2026-06-02T15:00:00.000Z', nullable: true })
  selectedAt!: string | null;

  @ApiProperty({ example: '2026-06-02T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-02T14:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: TenderOfferSupplierResponseDto })
  supplier!: TenderOfferSupplierResponseDto;
}

export class TenderDetailResponseDto extends TenderResponseDto {
  @ApiProperty({ type: TenderNeedResponseDto })
  need!: TenderNeedResponseDto;

  @ApiProperty({ type: TenderCreatorResponseDto })
  createdBy!: TenderCreatorResponseDto;

  @ApiProperty({ type: [TenderOfferResponseDto] })
  offers!: TenderOfferResponseDto[];
}
