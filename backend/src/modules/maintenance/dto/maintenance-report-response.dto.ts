import { ApiProperty } from '@nestjs/swagger';
import {
  MaintenancePriority,
  MaintenanceTicketStatus,
} from '@prisma/client';
import { MaintenanceReportContentDto } from './maintenance-report-content.dto';

export class MaintenanceReportAuthorDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'Amina' })
  firstName!: string;

  @ApiProperty({ example: 'Bennani' })
  lastName!: string;

  @ApiProperty({ example: 'amina.bennani@faculty.test' })
  email!: string;
}

export class MaintenanceReportTicketDto {
  @ApiProperty({ example: '03b9e503-f62f-4468-b3b3-fc7f1d0b8d3c' })
  id!: string;

  @ApiProperty({ enum: MaintenanceTicketStatus, example: MaintenanceTicketStatus.OPEN })
  status!: MaintenanceTicketStatus;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.HIGH })
  priority!: MaintenancePriority;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  openedAt!: string;
}

export class MaintenanceReportResponseDto extends MaintenanceReportContentDto {
  @ApiProperty({ example: '76d2d51e-2634-49ef-8480-170fe8e4d8c9' })
  id!: string;

  @ApiProperty({ example: '2026-06-03T11:00:00.000Z' })
  reportedAt!: string;

  @ApiProperty({ type: MaintenanceReportAuthorDto })
  author!: MaintenanceReportAuthorDto;

  @ApiProperty({ type: MaintenanceReportTicketDto })
  maintenanceTicket!: MaintenanceReportTicketDto;
}
