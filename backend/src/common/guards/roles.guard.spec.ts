import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../shared/enums/user-role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  function createGuard(requiredRoles: UserRole[] | undefined): RolesGuard {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector;

    return new RolesGuard(reflector);
  }

  function createContext(userRoles?: UserRole[]) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: userRoles ? { roles: userRoles } : undefined,
        }),
      }),
    };
  }

  it('allows access when no role is required', () => {
    const guard = createGuard(undefined);

    expect(guard.canActivate(createContext() as never)).toBe(true);
  });

  it('allows access when the authenticated user has the required role', () => {
    const guard = createGuard([UserRole.ADMIN]);

    expect(guard.canActivate(createContext([UserRole.ADMIN]) as never)).toBe(true);
  });

  it('allows access when one of several accepted roles matches', () => {
    const guard = createGuard([UserRole.ADMIN, UserRole.MANAGER]);

    expect(guard.canActivate(createContext([UserRole.MANAGER]) as never)).toBe(true);
  });

  it('denies access when the authenticated user has an insufficient role', () => {
    const guard = createGuard([UserRole.ADMIN]);

    expect(() => guard.canActivate(createContext([UserRole.USER]) as never)).toThrow(
      new ForbiddenException('Acces refuse: role insuffisant.'),
    );
  });

  it('denies access when the JWT user context contains no roles', () => {
    const guard = createGuard([UserRole.USER]);

    expect(() => guard.canActivate(createContext() as never)).toThrow(
      new ForbiddenException('Acces refuse: role insuffisant.'),
    );
  });
});
