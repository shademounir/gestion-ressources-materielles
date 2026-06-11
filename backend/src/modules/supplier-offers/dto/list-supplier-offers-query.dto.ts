import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierOfferStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListSupplierOffersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '32746c41-d6b8-45f1-9354-ad769e6ba7f0' })
  @IsOptional()
  @IsUUID(4)
  tenderId?: string;

  @ApiPropertyOptional({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  @IsOptional()
  @IsUUID(4)
  supplierId?: string;

  @ApiPropertyOptional({
    enum: SupplierOfferStatus,
    example: SupplierOfferStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(SupplierOfferStatus)
  status?: SupplierOfferStatus;
}
