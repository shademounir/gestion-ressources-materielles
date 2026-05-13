import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export enum AssignUserRole {
  ADMIN = UserRole.ADMIN,
  MANAGER = UserRole.MANAGER,
  USER = UserRole.USER,
}

export class AssignUserRoleDto {
  @ApiProperty({ enum: AssignUserRole, example: AssignUserRole.MANAGER })
  @IsEnum(AssignUserRole)
  role!: AssignUserRole;
}
