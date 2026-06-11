import { ApiProperty, PickType } from '@nestjs/swagger';
import { TenderResponseDto } from './tender-response.dto';

export class TenderListItemResponseDto extends PickType(TenderResponseDto, [
  'id',
  'reference',
  'title',
  'status',
  'deadline',
  'publishedAt',
  'awardedAt',
  'needId',
  'createdById',
  'createdAt',
  'updatedAt',
] as const) {}

export class TenderListMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class TenderListResponseDto {
  @ApiProperty({ type: [TenderListItemResponseDto] })
  data!: TenderListItemResponseDto[];

  @ApiProperty({ type: TenderListMetaResponseDto })
  meta!: TenderListMetaResponseDto;
}
