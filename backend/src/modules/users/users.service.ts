import { ConflictException, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getFoundationStatus() {
    return {
      module: 'users',
      status: 'foundation-ready',
      note: 'User business use cases will be implemented story by story.',
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const email = createUserDto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe deja.');
    }

    const role = await this.prisma.role.upsert({
      where: { name: createUserDto.role },
      update: {},
      create: {
        name: createUserDto.role,
      },
    });
    const passwordHash = await hash(createUserDto.password, 12);
    const createdUser = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName.trim(),
        lastName: createUserDto.lastName.trim(),
        email,
        passwordHash,
        status: createUserDto.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
        roleId: role.id,
      },
      include: {
        role: true,
      },
    });

    return {
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      role: createdUser.role.name as UserRole,
      isActive: createdUser.status === UserStatus.ACTIVE,
      createdAt: createdUser.createdAt.toISOString(),
    };
  }
}
