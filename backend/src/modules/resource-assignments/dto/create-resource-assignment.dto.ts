import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateResourceAssignmentDto {
  @ApiProperty({ example: '3d080019-8591-4d7b-9f33-a96718a8a3e7' })
  @IsUUID('4')
  resourceId!: string;

  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  @IsUUID('4')
  userId!: string;

  @ApiPropertyOptional({ example: 'Affectation pour le laboratoire informatique' })
  @IsOptional()
  @IsString()
  comment?: string;
}
