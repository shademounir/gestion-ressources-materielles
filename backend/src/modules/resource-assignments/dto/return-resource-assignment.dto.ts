import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReturnResourceAssignmentDto {
  @ApiPropertyOptional({ example: 'Ressource retournee en bon etat' })
  @IsOptional()
  @IsString()
  returnComment?: string;
}
