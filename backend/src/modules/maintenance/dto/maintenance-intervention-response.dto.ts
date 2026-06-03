import { ApiProperty } from '@nestjs/swagger';
import {
  MaintenancePriority,
  MaintenanceTicketStatus,
} from '@prisma/client';

export class MaintenanceInterventionTicketDto {
  @ApiProperty({ example: '03b9e503-f62f-4468-b3b3-fc7f1d0b8d3c' })
  id!: string;

  @ApiProperty({
    enum: MaintenanceTicketStatus,
    example: MaintenanceTicketStatus.IN_PROGRESS,
  })
  status!: MaintenanceTicketStatus;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.HIGH })
  priority!: MaintenancePriority;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  openedAt!: string;
}

export class MaintenanceInterventionResponseDto {
  @ApiProperty({ example: '90d6f480-b6ee-427b-885e-9d6279f1636c' })
  id!: string;

  @ApiProperty({ example: '03b9e503-f62f-4468-b3b3-fc7f1d0b8d3c' })
  maintenanceTicketId!: string;

  @ApiProperty({ example: 'Technicien maintenance interne' })
  technicianName!: string;

  @ApiProperty({ example: 'Remplacement du bloc alimentation et test de demarrage.' })
  description!: string;

  @ApiProperty({ example: '2026-06-03T13:00:00.000Z' })
  startedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  completedAt!: string | null;

  @ApiProperty({ example: null, nullable: true })
  cost!: string | null;

  @ApiProperty({ example: null, nullable: true })
  result!: string | null;

  @ApiProperty({ example: '2026-06-03T13:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-03T13:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: MaintenanceInterventionTicketDto })
  maintenanceTicket!: MaintenanceInterventionTicketDto;
}
