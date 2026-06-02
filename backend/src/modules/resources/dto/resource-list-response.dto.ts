import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';

export class ResourceListItemResponseDto {
  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  id!: string;

  @ApiProperty({ example: 'INV-INFO-2026-0001' })
  inventoryCode!: string;

  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5440' })
  name!: string;

  @ApiProperty({ example: 'Informatique' })
  category!: string;

  @ApiProperty({ enum: ResourceStatus, example: ResourceStatus.AVAILABLE })
  status!: ResourceStatus;

  @ApiPropertyOptional({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4', nullable: true })
  supplierId!: string | null;

  @ApiProperty({ example: '2026-06-02T16:00:00.000Z' })
  createdAt!: string;
}

export class ResourceListMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class ResourceListResponseDto {
  @ApiProperty({ type: [ResourceListItemResponseDto] })
  data!: ResourceListItemResponseDto[];

  @ApiProperty({ type: ResourceListMetaResponseDto })
  meta!: ResourceListMetaResponseDto;
}
