import { ApiPropertyOptional } from '@nestjs/swagger';
import { TenderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListTendersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'AO-20260602' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TenderStatus, example: TenderStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(TenderStatus)
  status?: TenderStatus;
}
