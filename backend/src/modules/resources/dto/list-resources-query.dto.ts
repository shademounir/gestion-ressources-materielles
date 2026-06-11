import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export enum ResourceCreatedAtSort {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListResourcesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Latitude' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'INV-INFO-2026' })
  @IsOptional()
  @IsString()
  inventoryCode?: string;

  @ApiPropertyOptional({ enum: ResourceStatus, example: ResourceStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @ApiPropertyOptional({ example: 'Informatique' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: ResourceCreatedAtSort,
    default: ResourceCreatedAtSort.DESC,
  })
  @IsOptional()
  @IsEnum(ResourceCreatedAtSort)
  createdAtSort?: ResourceCreatedAtSort;
}
