import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceAssignmentStatus } from '@prisma/client';

export class ResourceAssignmentResponseDto {
  @ApiProperty({ example: 'd8a8b0c8-6f2d-40f2-b01b-d981b20c98e2' })
  id!: string;

  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  resourceId!: string;

  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  userId!: string;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  assignedAt!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  returnedAt!: string | null;

  @ApiProperty({
    enum: ResourceAssignmentStatus,
    example: ResourceAssignmentStatus.ACTIVE,
  })
  status!: ResourceAssignmentStatus;

  @ApiPropertyOptional({
    example: 'Affectation pour le laboratoire informatique',
    nullable: true,
  })
  comment!: string | null;

  @ApiPropertyOptional({
    example: 'Ressource retournee en bon etat',
    nullable: true,
  })
  returnComment!: string | null;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-03T09:00:00.000Z' })
  updatedAt!: string;
}
