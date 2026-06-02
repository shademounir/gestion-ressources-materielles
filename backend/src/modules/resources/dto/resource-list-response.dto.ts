import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResourceBaseResponseDto } from './resource-base-response.dto';

export class ResourceListItemResponseDto extends PickType(
  ResourceBaseResponseDto,
  ['id', 'inventoryCode', 'name', 'category', 'status', 'supplierId', 'createdAt'] as const,
) {}

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
