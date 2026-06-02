import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NeedPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateDepartmentNeedItemDto {
  @ApiProperty({ example: 'PC portable' })
  @IsString()
  @MinLength(2)
  designation!: string;

  @ApiPropertyOptional({ example: 'Ordinateur portable pour salle informatique' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 7500, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedUnitPrice?: number;
}

export class CreateDepartmentNeedDto {
  @ApiProperty({ example: 'Equipement salle informatique' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Renouveler le materiel de la salle informatique.' })
  @IsString()
  @MinLength(10)
  justification!: string;

  @ApiProperty({ enum: NeedPriority, example: NeedPriority.HIGH })
  @IsEnum(NeedPriority)
  priority!: NeedPriority;

  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  @IsUUID(4)
  departmentId!: string;

  @ApiProperty({ type: [CreateDepartmentNeedItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDepartmentNeedItemDto)
  items!: CreateDepartmentNeedItemDto[];
}
