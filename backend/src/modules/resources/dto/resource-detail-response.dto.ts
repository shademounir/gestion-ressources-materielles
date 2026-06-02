import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceStatus, SupplierStatus } from '@prisma/client';

export class ResourceSupplierResponseDto {
  @ApiProperty({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  id!: string;

  @ApiProperty({ example: 'Tech Solutions Maroc' })
  name!: string;

  @ApiPropertyOptional({ example: 'contact@techsolutions.test', nullable: true })
  contactEmail!: string | null;

  @ApiPropertyOptional({ example: '+212 522 000 000', nullable: true })
  phone!: string | null;

  @ApiProperty({ enum: SupplierStatus, example: SupplierStatus.ACTIVE })
  status!: SupplierStatus;
}

export class ResourceDetailResponseDto {
  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  id!: string;

  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5440' })
  name!: string;

  @ApiProperty({ example: 'INV-INFO-2026-0001' })
  inventoryCode!: string;

  @ApiProperty({ example: 'Informatique' })
  category!: string;

  @ApiPropertyOptional({ example: 'PC portable destine aux salles informatiques', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 'SN-DL-5440-2026-001', nullable: true })
  serialNumber!: string | null;

  @ApiPropertyOptional({ example: '2026-06-02T00:00:00.000Z', nullable: true })
  acquisitionDate!: string | null;

  @ApiPropertyOptional({ example: '12500', nullable: true })
  acquisitionValue!: string | null;

  @ApiProperty({ enum: ResourceStatus, example: ResourceStatus.AVAILABLE })
  status!: ResourceStatus;

  @ApiPropertyOptional({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4', nullable: true })
  supplierId!: string | null;

  @ApiPropertyOptional({ type: ResourceSupplierResponseDto, nullable: true })
  supplier!: ResourceSupplierResponseDto | null;

  @ApiProperty({ example: '2026-06-02T16:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-02T16:00:00.000Z' })
  updatedAt!: string;
}
