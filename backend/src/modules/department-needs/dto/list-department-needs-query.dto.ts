import { ApiPropertyOptional } from '@nestjs/swagger';
import { NeedPriority, NeedStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListDepartmentNeedsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  @IsOptional()
  @IsUUID(4)
  departmentId?: string;

  @ApiPropertyOptional({ enum: NeedStatus, example: NeedStatus.SUBMITTED })
  @IsOptional()
  @IsEnum(NeedStatus)
  status?: NeedStatus;

  @ApiPropertyOptional({ enum: NeedPriority, example: NeedPriority.HIGH })
  @IsOptional()
  @IsEnum(NeedPriority)
  priority?: NeedPriority;
}
