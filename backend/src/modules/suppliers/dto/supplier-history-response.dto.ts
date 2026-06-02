import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierStatus } from '@prisma/client';

export class SupplierHistoryIdentityDto {
  @ApiProperty({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  id!: string;

  @ApiProperty({ example: 'Tech Solutions Maroc' })
  name!: string;

  @ApiPropertyOptional({ example: 'contact@techsolutions.test', nullable: true })
  contactEmail!: string | null;

  @ApiPropertyOptional({ example: '+212 522 000 000', nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'Casablanca, Maroc', nullable: true })
  address!: string | null;
}

export class SupplierHistoryResponseDto {
  @ApiProperty({ type: SupplierHistoryIdentityDto })
  supplierIdentity!: SupplierHistoryIdentityDto;

  @ApiProperty({ enum: SupplierStatus, example: SupplierStatus.ACTIVE })
  supplierStatus!: SupplierStatus;

  @ApiProperty({ example: '2026-06-02T11:00:00.000Z' })
  supplierCreatedAt!: string;

  @ApiProperty({ example: '2026-06-02T11:30:00.000Z' })
  supplierUpdatedAt!: string;

  @ApiProperty({ example: 0 })
  offersCount!: number;

  @ApiProperty({ example: 0 })
  tendersCount!: number;

  @ApiProperty({ example: 0 })
  maintenanceReturnsCount!: number;
}
