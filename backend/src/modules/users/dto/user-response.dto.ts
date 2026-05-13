import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'Amina' })
  firstName!: string;

  @ApiProperty({ example: 'Bennani' })
  lastName!: string;

  @ApiProperty({ example: 'amina.bennani@faculty.test' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-05-13T15:30:00.000Z' })
  createdAt!: string;
}
