import { ApiProperty } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateResourceStatusDto {
  @ApiProperty({ enum: ResourceStatus, example: ResourceStatus.UNDER_MAINTENANCE })
  @IsEnum(ResourceStatus)
  status!: ResourceStatus;
}
