import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5440' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'INV-INFO-2026-0001' })
  @IsString()
  @MinLength(2)
  inventoryCode!: string;

  @ApiProperty({ example: 'Informatique' })
  @IsString()
  @MinLength(2)
  category!: string;

  @ApiPropertyOptional({ example: 'PC portable destine aux salles informatiques' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'SN-DL-5440-2026-001' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ example: '2026-06-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @ApiPropertyOptional({ example: 12500 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  acquisitionValue?: number;

  @ApiPropertyOptional({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  @IsOptional()
  @IsUUID('4')
  supplierId?: string;
}
