import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceSeverity } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class MaintenanceReportContentDto {
  @ApiProperty({ example: 'Carte mere defectueuse apres test de demarrage.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  diagnosis!: string;

  @ApiProperty({ example: 'Surtension probable au niveau de l alimentation.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  probableCause!: string;

  @ApiProperty({ enum: MaintenanceSeverity, example: MaintenanceSeverity.HIGH })
  @IsEnum(MaintenanceSeverity)
  severity!: MaintenanceSeverity;

  @ApiPropertyOptional({
    example: 'Remplacer la carte mere et verifier le bloc alimentation.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  recommendations?: string | null;
}
