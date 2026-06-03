import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class MaintenanceInterventionContentDto {
  @ApiProperty({ example: 'Technicien maintenance interne' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  technicianName!: string;

  @ApiProperty({ example: 'Remplacement du bloc alimentation et test de demarrage.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  description!: string;

  @ApiProperty({ example: '2026-06-03T13:00:00.000Z' })
  @IsDateString()
  startedAt!: string;

  @ApiPropertyOptional({ example: '2026-06-03T15:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ example: 'Ressource testee et remise en fonctionnement.' })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  result?: string;
}
