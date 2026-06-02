import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NeedPriority, NeedStatus } from '@prisma/client';

export class DepartmentNeedItemResponseDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'PC portable' })
  designation!: string;

  @ApiPropertyOptional({ example: 'Ordinateur portable pour salle informatique', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 10 })
  quantity!: number;

  @ApiPropertyOptional({ example: 7500, nullable: true })
  estimatedUnitPrice!: number | null;

  @ApiProperty({ example: '2026-06-02T10:00:00.000Z' })
  createdAt!: string;
}

export class DepartmentNeedResponseDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'Equipement salle informatique' })
  title!: string;

  @ApiProperty({ example: 'Renouveler le materiel de la salle informatique.' })
  justification!: string;

  @ApiProperty({ enum: NeedPriority, example: NeedPriority.HIGH })
  priority!: NeedPriority;

  @ApiProperty({ enum: NeedStatus, example: NeedStatus.SUBMITTED })
  status!: NeedStatus;

  @ApiProperty({ example: 'department-1' })
  departmentId!: string;

  @ApiProperty({ example: 'user-1' })
  createdById!: string;

  @ApiProperty({ type: [DepartmentNeedItemResponseDto] })
  items!: DepartmentNeedItemResponseDto[];

  @ApiProperty({ example: '2026-06-02T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-02T10:00:00.000Z' })
  updatedAt!: string;
}
