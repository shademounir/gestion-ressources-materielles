import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role.enum';

class AuthenticatedUserDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'admin@faculty.test' })
  email!: string;

  @ApiProperty({ example: 'Amina' })
  firstName!: string;

  @ApiProperty({ example: 'Bennani' })
  lastName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user!: AuthenticatedUserDto;
}
