import { ApiProperty } from '@nestjs/swagger';
import { SupplierResponseDto } from './supplier-response.dto';

export class SupplierListMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class SupplierListResponseDto {
  @ApiProperty({ type: [SupplierResponseDto] })
  data!: SupplierResponseDto[];

  @ApiProperty({ type: SupplierListMetaResponseDto })
  meta!: SupplierListMetaResponseDto;
}
