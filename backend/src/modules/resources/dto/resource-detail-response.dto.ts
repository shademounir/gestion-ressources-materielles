import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierStatus } from '@prisma/client';
import { ResourceExtendedResponseDto } from './resource-base-response.dto';

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

export class ResourceDetailResponseDto extends ResourceExtendedResponseDto {
  @ApiPropertyOptional({ type: ResourceSupplierResponseDto, nullable: true })
  supplier!: ResourceSupplierResponseDto | null;

  @ApiProperty({ example: '2026-06-02T16:00:00.000Z' })
  updatedAt!: string;
}
