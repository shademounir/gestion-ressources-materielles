import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ResourceCreatedAtSort {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListResourcesQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

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
