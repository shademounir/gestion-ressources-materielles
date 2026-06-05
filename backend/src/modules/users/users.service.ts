import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AssignUserDepartmentDto } from './dto/assign-user-department.dto';
import { AssignUserRole, AssignUserRoleDto } from './dto/assign-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  getFoundationStatus() {
    return {
      module: 'users',
      status: 'foundation-ready',
      note: 'User business use cases will be implemented story by story.',
    };
  }

  async listUsers(query: ListUsersQueryDto): Promise<UserListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.role ? { role: { name: query.role } } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
          department: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => this.toUserResponse(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return this.toUserResponse(user);
  }

  async createUser(
    createUserDto: CreateUserDto,
    actorUserId?: string | null,
  ): Promise<UserResponseDto> {
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

    await this.auditLogsService.logUserCreated(createdUser.id, actorUserId);

    return this.toUserResponse(createdUser);
  }

  async deactivateUser(
    id: string,
    actorUserId?: string | null,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const deactivatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
      },
      include: {
        role: true,
      },
    });

    await this.auditLogsService.logUserDeactivated(
      deactivatedUser.id,
      actorUserId,
    );

    return this.toUserResponse(deactivatedUser);
  }

  async assignUserRole(
    id: string,
    assignUserRoleDto: AssignUserRoleDto,
    actorUserId?: string | null,
  ): Promise<UserResponseDto> {
    if (!Object.values(AssignUserRole).includes(assignUserRoleDto.role)) {
      throw new BadRequestException('Role utilisateur invalide.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const role = await this.prisma.role.upsert({
      where: { name: assignUserRoleDto.role },
      update: {},
      create: {
        name: assignUserRoleDto.role,
      },
    });
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        roleId: role.id,
      },
      include: {
        role: true,
      },
    });

    await this.auditLogsService.logUserRoleUpdated(
      updatedUser.id,
      updatedUser.role.name,
      actorUserId,
    );

    return this.toUserResponse(updatedUser);
  }

  async assignUserDepartment(
    id: string,
    assignUserDepartmentDto: AssignUserDepartmentDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const existingDepartment = await this.prisma.department.findUnique({
      where: { id: assignUserDepartmentDto.departmentId },
      select: { id: true, deletedAt: true },
    });

    if (!existingDepartment || existingDepartment.deletedAt) {
      throw new NotFoundException('Departement introuvable.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        departmentId: assignUserDepartmentDto.departmentId,
      },
      include: {
        role: true,
        department: true,
      },
    });

    return this.toUserResponse(updatedUser);
  }

  private toUserResponse(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: UserStatus;
    createdAt: Date;
    role: { name: string };
    department?: { id: string; name: string } | null;
  }): UserResponseDto {
    const response: UserResponseDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: this.toUserRole(user.role.name),
      isActive: user.status === UserStatus.ACTIVE,
      createdAt: user.createdAt.toISOString(),
    };

    if (user.department !== undefined) {
      response.department = user.department
        ? {
            id: user.department.id,
            name: user.department.name,
          }
        : null;
    }

    return response;
  }

  private toUserRole(roleName: string): UserRole {
    if (Object.values(UserRole).includes(roleName as UserRole)) {
      return roleName as UserRole;
    }

    throw new BadRequestException('Role utilisateur invalide.');
  }
}
