import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ example: 'Deconnexion effectuee.' })
  message!: string;

  @ApiProperty({ example: '2026-05-13T14:30:00.000Z' })
  loggedOutAt!: string;

  @ApiProperty({
    example: 'CLIENT_CONTEXT_CLEARED',
    description: 'Stateless JWT logout strategy for the current foundation.',
  })
  sessionState!: 'CLIENT_CONTEXT_CLEARED';

  @ApiProperty({
    example: false,
    description: 'Reserved for future refresh token revocation support.',
  })
  refreshTokenRevoked!: boolean;
}
