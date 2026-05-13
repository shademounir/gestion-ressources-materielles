import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  function createStrategy(): JwtStrategy {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    return new JwtStrategy(configService);
  }

  it('maps JWT payload roles to the authenticated request user', () => {
    const strategy = createStrategy();

    expect(
      strategy.validate({
        sub: 'user-1',
        email: 'admin@faculty.test',
        roles: [UserRole.ADMIN],
      }),
    ).toEqual({
      userId: 'user-1',
      email: 'admin@faculty.test',
      roles: [UserRole.ADMIN],
    });
  });

  it('keeps compatibility with JWT payloads carrying a single role', () => {
    const strategy = createStrategy();

    expect(
      strategy.validate({
        sub: 'user-2',
        email: 'manager@faculty.test',
        role: UserRole.MANAGER,
      }),
    ).toEqual({
      userId: 'user-2',
      email: 'manager@faculty.test',
      roles: [UserRole.MANAGER],
    });
  });
});
