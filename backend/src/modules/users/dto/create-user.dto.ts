import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export enum CreateUserRole {
  ADMIN = UserRole.ADMIN,
  MANAGER = UserRole.MANAGER,
  USER = UserRole.USER,
}

export class CreateUserDto {
  @ApiProperty({ example: 'Amina' })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Bennani' })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: 'amina.bennani@faculty.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: CreateUserRole, example: CreateUserRole.USER })
  @IsEnum(CreateUserRole)
  role!: CreateUserRole;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}
