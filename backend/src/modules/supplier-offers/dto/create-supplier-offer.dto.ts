import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSupplierOfferDto {
  @ApiProperty({ example: '32746c41-d6b8-45f1-9354-ad769e6ba7f0' })
  @IsUUID(4)
  tenderId!: string;

  @ApiProperty({ example: '86dbd4f8-3850-46b6-9c1a-f3fc3b9339a4' })
  @IsUUID(4)
  supplierId!: string;

  @ApiProperty({ example: 125000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  proposedDeliveryDays!: number;

  @ApiPropertyOptional({ example: 'Livraison possible en deux lots.' })
  @IsOptional()
  @IsString()
  comment?: string;
}
