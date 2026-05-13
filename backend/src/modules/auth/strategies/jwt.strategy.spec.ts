import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          status: UserStatus.ACTIVE,
          deletedAt: null,
        }),
      },
    };
  });

  function createStrategy(): JwtStrategy {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    return new JwtStrategy(configService, prisma as unknown as PrismaService);
  }

  it('maps JWT payload roles to the authenticated request user', async () => {
    const strategy = createStrategy();

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'admin@faculty.test',
        roles: [UserRole.ADMIN],
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'admin@faculty.test',
      roles: [UserRole.ADMIN],
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, status: true, deletedAt: true },
    });
  });

  it('keeps compatibility with JWT payloads carrying a single role', async () => {
    const strategy = createStrategy();

    await expect(
      strategy.validate({
        sub: 'user-2',
        email: 'manager@faculty.test',
        role: UserRole.MANAGER,
      }),
    ).resolves.toEqual({
      userId: 'user-2',
      email: 'manager@faculty.test',
      roles: [UserRole.MANAGER],
    });
  });

  it('rejects JWT access for inactive users', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.INACTIVE,
      deletedAt: null,
    });
    const strategy = createStrategy();

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'inactive@faculty.test',
        roles: [UserRole.USER],
      }),
    ).rejects.toThrow(new UnauthorizedException('Utilisateur non autorise.'));
  });

  it('rejects JWT access for missing users', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const strategy = createStrategy();

    await expect(
      strategy.validate({
        sub: 'missing-user',
        email: 'missing@faculty.test',
        roles: [UserRole.USER],
      }),
    ).rejects.toThrow(new UnauthorizedException('Utilisateur non autorise.'));
  });
});
