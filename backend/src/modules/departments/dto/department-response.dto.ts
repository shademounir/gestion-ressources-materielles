import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentStatus } from '@prisma/client';

export class DepartmentResponseDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'Informatique' })
  name!: string;

  @ApiPropertyOptional({ example: 'Departement des sciences informatiques', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: DepartmentStatus, example: DepartmentStatus.ACTIVE })
  status!: DepartmentStatus;

  @ApiProperty({ example: '2026-05-14T09:30:00.000Z' })
  createdAt!: string;
}
