import { ApiProperty } from '@nestjs/swagger';
import { MaintenancePriority, MaintenanceTicketStatus } from '@prisma/client';

export class MaintenanceTicketResponseDto {
  @ApiProperty({ example: '03b9e503-f62f-4468-b3b3-fc7f1d0b8d3c' })
  id!: string;

  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  resourceId!: string;

  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  reportedById!: string;

  @ApiProperty({ example: 'Le poste ne demarre plus et affiche un ecran noir.' })
  description!: string;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.HIGH })
  priority!: MaintenancePriority;

  @ApiProperty({ enum: MaintenanceTicketStatus, example: MaintenanceTicketStatus.OPEN })
  status!: MaintenanceTicketStatus;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  openedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  closedAt!: string | null;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  updatedAt!: string;
}
