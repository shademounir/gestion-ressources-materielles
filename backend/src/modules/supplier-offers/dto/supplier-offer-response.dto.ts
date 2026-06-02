import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierOfferStatus } from '@prisma/client';

export class SupplierOfferResponseDto {
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
}
