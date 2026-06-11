import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SupplierReturnContentDto {
  @ApiProperty({ example: '9f674894-58df-449d-a019-3f55f6b89908' })
  @IsUUID('4')
  supplierId!: string;

  @ApiProperty({ example: 'Diagnostic confirme une panne sous garantie.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  reason!: string;

  @ApiProperty({ example: '2026-06-03T14:00:00.000Z' })
  @IsDateString()
  sentAt!: string;

  @ApiPropertyOptional({ example: '2026-06-17T14:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedReturnAt?: string;

  @ApiPropertyOptional({ example: 'Retour envoye avec bon de prise en charge.' })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  comment?: string;
}
