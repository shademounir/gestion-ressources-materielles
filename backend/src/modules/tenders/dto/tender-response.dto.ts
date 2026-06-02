import { ApiProperty } from '@nestjs/swagger';
import { TenderStatus } from '@prisma/client';

export class TenderResponseDto {
  @ApiProperty({ example: '32746c41-d6b8-45f1-9354-ad769e6ba7f0' })
  id!: string;

  @ApiProperty({ example: 'AO-20260602-0001' })
  reference!: string;

  @ApiProperty({ example: 'Appel d offres - Equipement salle informatique' })
  title!: string;

  @ApiProperty({
    example: 'Acquisition de postes informatiques et peripheriques pour la salle A12.',
  })
  description!: string;

  @ApiProperty({ enum: TenderStatus, example: TenderStatus.DRAFT })
  status!: TenderStatus;

  @ApiProperty({ example: '2026-07-15T12:00:00.000Z' })
  deadline!: string;

  @ApiProperty({ example: '2d891e20-3552-4ed6-8227-42fb698d7d2e' })
  needId!: string;

  @ApiProperty({ example: '3d15d575-fd17-446f-94f3-c5560e557f50' })
  createdById!: string;

  @ApiProperty({ example: '2026-06-02T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-02T12:00:00.000Z' })
  updatedAt!: string;
}
