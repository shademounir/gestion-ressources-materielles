import { ApiProperty } from '@nestjs/swagger';
import {
  MaintenancePriority,
  MaintenanceTicketStatus,
  ResourceStatus,
  SupplierReturnStatus,
  SupplierStatus,
} from '@prisma/client';

export class SupplierReturnTicketDto {
  @ApiProperty({ example: '03b9e503-f62f-4468-b3b3-fc7f1d0b8d3c' })
  id!: string;

  @ApiProperty({ enum: MaintenanceTicketStatus, example: MaintenanceTicketStatus.IN_PROGRESS })
  status!: MaintenanceTicketStatus;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.HIGH })
  priority!: MaintenancePriority;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  openedAt!: string;
}

export class SupplierReturnResourceDto {
  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  id!: string;

  @ApiProperty({ example: 'INV-INFO-2026-0001' })
  inventoryCode!: string;

  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5440' })
  name!: string;

  @ApiProperty({ enum: ResourceStatus, example: ResourceStatus.UNDER_MAINTENANCE })
  status!: ResourceStatus;
}

export class SupplierReturnSupplierDto {
  @ApiProperty({ example: '9f674894-58df-449d-a019-3f55f6b89908' })
  id!: string;

  @ApiProperty({ example: 'Tech Solutions Maroc' })
  name!: string;

  @ApiProperty({ example: 'contact@techsolutions.test', nullable: true })
  contactEmail!: string | null;

  @ApiProperty({ enum: SupplierStatus, example: SupplierStatus.ACTIVE })
  status!: SupplierStatus;
}

export class SupplierReturnResponseDto {
  @ApiProperty({ example: 'cc2567b2-881e-4986-814e-2de7197eb7f2' })
  id!: string;

  @ApiProperty({ example: '03b9e503-f62f-4468-b3b3-fc7f1d0b8d3c' })
  maintenanceTicketId!: string;

  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  resourceId!: string;

  @ApiProperty({ example: '9f674894-58df-449d-a019-3f55f6b89908' })
  supplierId!: string;

  @ApiProperty({ example: 'Diagnostic confirme une panne sous garantie.' })
  reason!: string;

  @ApiProperty({ example: '2026-06-03T14:00:00.000Z' })
  sentAt!: string;

  @ApiProperty({ example: '2026-06-17T14:00:00.000Z', nullable: true })
  expectedReturnAt!: string | null;

  @ApiProperty({ example: null, nullable: true })
  actualReturnAt!: string | null;

  @ApiProperty({
    enum: SupplierReturnStatus,
    example: SupplierReturnStatus.SENT_TO_SUPPLIER,
  })
  status!: SupplierReturnStatus;

  @ApiProperty({ example: 'Retour envoye avec bon de prise en charge.', nullable: true })
  comment!: string | null;

  @ApiProperty({ example: '2026-06-03T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-03T14:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: SupplierReturnTicketDto })
  maintenanceTicket!: SupplierReturnTicketDto;

  @ApiProperty({ type: SupplierReturnResourceDto })
  resource!: SupplierReturnResourceDto;

  @ApiProperty({ type: SupplierReturnSupplierDto })
  supplier!: SupplierReturnSupplierDto;
}
