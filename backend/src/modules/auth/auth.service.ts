import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { compare } from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../shared/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  getFoundationStatus() {
    return {
      module: 'auth',
      status: 'foundation-ready',
      features: ['jwt-foundation', 'rbac-decorators', 'guards'],
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Compte utilisateur non actif.');
    }

    const isPasswordValid = await compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const role = user.role.name as UserRole;
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const expiresInSeconds = this.resolveExpiresInSeconds(expiresIn);
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles: [role],
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: expiresInSeconds,
      },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
      },
    };
  }

  logout(user: AuthenticatedUser | undefined): LogoutResponseDto {
    if (!user?.userId) {
      throw new UnauthorizedException('Utilisateur non authentifie.');
    }

    return {
      message: 'Deconnexion effectuee.',
      loggedOutAt: new Date().toISOString(),
      sessionState: 'CLIENT_CONTEXT_CLEARED',
      refreshTokenRevoked: false,
    };
  }

  private resolveExpiresInSeconds(expiresIn: string): number {
    const match = /^(?<value>\d+)(?<unit>[smhd])?$/.exec(expiresIn);

    if (!match?.groups) {
      return 900;
    }

    const value = Number(match.groups.value);
    const unit = match.groups.unit ?? 's';
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
  }
}
