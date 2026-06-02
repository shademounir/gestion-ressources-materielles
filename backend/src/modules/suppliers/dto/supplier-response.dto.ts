import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierStatus } from '@prisma/client';

export class SupplierResponseDto {
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

  @ApiProperty({ enum: SupplierStatus, example: SupplierStatus.ACTIVE })
  status!: SupplierStatus;

  @ApiProperty({ example: '2026-06-02T11:00:00.000Z' })
  createdAt!: string;
}
