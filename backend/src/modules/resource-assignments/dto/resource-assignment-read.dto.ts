import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResourceStatus } from '@prisma/client';
import { ResourceAssignmentResponseDto } from './resource-assignment-response.dto';

export class ResourceAssignmentResourceDto {
  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  id!: string;

  @ApiProperty({ example: 'INV-INFO-2026-0001' })
  inventoryCode!: string;

  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5440' })
  name!: string;

  @ApiProperty({ example: 'Informatique' })
  category!: string;

  @ApiProperty({ enum: ResourceStatus, example: ResourceStatus.ASSIGNED })
  status!: ResourceStatus;
}

export class ResourceAssignmentUserDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'Amina' })
  firstName!: string;

  @ApiProperty({ example: 'Bennani' })
  lastName!: string;

  @ApiProperty({ example: 'amina.bennani@faculty.test' })
  email!: string;
}

export class ResourceAssignmentHistoryItemDto extends PickType(
  ResourceAssignmentResponseDto,
  ['id', 'resourceId', 'userId', 'status', 'assignedAt', 'returnedAt', 'comment', 'returnComment'] as const,
) {
  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5440' })
  resourceName!: string;

  @ApiProperty({ example: 'INV-INFO-2026-0001' })
  inventoryCode!: string;

  @ApiProperty({ example: 'Amina Bennani' })
  userFullName!: string;
}

export class ResourceAssignmentListMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class ResourceAssignmentHistoryResponseDto {
  @ApiProperty({ type: [ResourceAssignmentHistoryItemDto] })
  data!: ResourceAssignmentHistoryItemDto[];

  @ApiProperty({ type: ResourceAssignmentListMetaDto })
  meta!: ResourceAssignmentListMetaDto;
}

export class ResourceAssignmentDetailDto extends PickType(
  ResourceAssignmentResponseDto,
  ['id', 'status', 'assignedAt', 'returnedAt', 'comment', 'returnComment', 'createdAt', 'updatedAt'] as const,
) {
  @ApiProperty({ type: ResourceAssignmentResourceDto })
  resource!: ResourceAssignmentResourceDto;

  @ApiProperty({ type: ResourceAssignmentUserDto })
  user!: ResourceAssignmentUserDto;
}
