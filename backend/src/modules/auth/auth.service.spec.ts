import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AuthService } from './auth.service';

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
  };
};

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaMock;
  let jwtService: { signAsync: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-access-token'),
    };
    const configService = {
      get: jest.fn().mockReturnValue('15m'),
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService,
    );
  });

  it('accepts valid credentials and returns a JWT carrying the user role', async () => {
    const passwordHash = await hash('ValidPass123!', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@faculty.test',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Bennani',
      status: UserStatus.ACTIVE,
      deletedAt: null,
      role: {
        name: RoleName.ADMIN,
      },
    });

    const result = await authService.login({
      email: ' Admin@Faculty.Test ',
      password: 'ValidPass123!',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@faculty.test' },
      include: { role: true },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      {
        sub: 'user-1',
        email: 'admin@faculty.test',
        roles: [UserRole.ADMIN],
      },
      {
        secret: 'test-jwt-secret',
        expiresIn: 900,
      },
    );
    expect(result).toEqual({
      accessToken: 'signed-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'user-1',
        email: 'admin@faculty.test',
        firstName: 'Amina',
        lastName: 'Bennani',
        role: UserRole.ADMIN,
      },
    });
  });

  it('rejects unknown users with a clear error message', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@faculty.test',
        password: 'ValidPass123!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Identifiants invalides.'));
  });

  it('rejects invalid passwords with a clear error message', async () => {
    const passwordHash = await hash('ValidPass123!', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'teacher@faculty.test',
      passwordHash,
      firstName: 'Youssef',
      lastName: 'Alami',
      status: UserStatus.ACTIVE,
      deletedAt: null,
      role: {
        name: RoleName.TEACHER,
      },
    });

    await expect(
      authService.login({
        email: 'teacher@faculty.test',
        password: 'WrongPass123!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Identifiants invalides.'));
  });

  it('rejects inactive users', async () => {
    const passwordHash = await hash('ValidPass123!', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'inactive@faculty.test',
      passwordHash,
      firstName: 'Nadia',
      lastName: 'Saidi',
      status: UserStatus.INACTIVE,
      deletedAt: null,
      role: {
        name: RoleName.TEACHER,
      },
    });

    await expect(
      authService.login({
        email: 'inactive@faculty.test',
        password: 'ValidPass123!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Compte utilisateur non actif.'));
  });
});
