import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTenderDto {
  @ApiPropertyOptional({ example: 'AO-20260602-0001' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  reference?: string;

  @ApiProperty({ example: 'Appel d offres - Equipement salle informatique' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({
    example: 'Acquisition de postes informatiques et peripheriques pour la salle A12.',
  })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ example: '2026-07-15T12:00:00.000Z' })
  @IsDateString()
  deadline!: string;

  @ApiProperty({ example: '2d891e20-3552-4ed6-8227-42fb698d7d2e' })
  @IsUUID(4)
  needId!: string;
}
