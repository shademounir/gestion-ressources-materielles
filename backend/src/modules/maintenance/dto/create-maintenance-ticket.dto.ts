import { ApiProperty } from '@nestjs/swagger';
import { MaintenancePriority } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMaintenanceTicketDto {
  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  @IsUUID('4')
  resourceId!: string;

  @ApiProperty({ example: 'Le poste ne demarre plus et affiche un ecran noir.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.HIGH })
  @IsEnum(MaintenancePriority)
  priority!: MaintenancePriority;
}
