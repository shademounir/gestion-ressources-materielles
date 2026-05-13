import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RoleName, UserStatus } from '@prisma/client';
import { compare } from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AssignUserRole } from './dto/assign-user-role.dto';
import { CreateUserRole } from './dto/create-user.dto';
import { UsersService } from './users.service';

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  role: {
    upsert: jest.Mock;
  };
};

type UserCreateMockArgs = {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    status: UserStatus;
    roleId: string;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        upsert: jest.fn(),
      },
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('creates an active user with a hashed password and initial role', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.role.upsert.mockResolvedValue({
      id: 'role-user',
      name: RoleName.USER,
    });
    prisma.user.create.mockImplementation((args: UserCreateMockArgs) => ({
      id: 'user-1',
      firstName: args.data.firstName,
      lastName: args.data.lastName,
      email: args.data.email,
      status: args.data.status,
      createdAt: new Date('2026-05-13T15:30:00.000Z'),
      role: {
        name: RoleName.USER,
      },
    }));

    const result = await service.createUser({
      firstName: ' Amina ',
      lastName: ' Bennani ',
      email: ' Amina.Bennani@Faculty.Test ',
      password: 'ChangeMe123!',
      role: CreateUserRole.USER,
      isActive: true,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'amina.bennani@faculty.test' },
      select: { id: true },
    });
    expect(prisma.role.upsert).toHaveBeenCalledWith({
      where: { name: RoleName.USER },
      update: {},
      create: { name: RoleName.USER },
    });
    const createCall = prisma.user.create.mock.calls[0]?.[0] as {
      data: { passwordHash: string; status: UserStatus; roleId: string };
    };
    expect(createCall.data.passwordHash).not.toBe('ChangeMe123!');
    await expect(compare('ChangeMe123!', createCall.data.passwordHash)).resolves.toBe(true);
    expect(createCall.data.status).toBe(UserStatus.ACTIVE);
    expect(createCall.data.roleId).toBe('role-user');
    expect(result).toEqual({
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      role: UserRole.USER,
      isActive: true,
      createdAt: '2026-05-13T15:30:00.000Z',
    });
  });

  it('creates an inactive user when requested', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.role.upsert.mockResolvedValue({
      id: 'role-manager',
      name: RoleName.MANAGER,
    });
    prisma.user.create.mockImplementation((args: UserCreateMockArgs) => ({
      id: 'user-2',
      firstName: args.data.firstName,
      lastName: args.data.lastName,
      email: args.data.email,
      status: args.data.status,
      createdAt: new Date('2026-05-13T15:45:00.000Z'),
      role: {
        name: RoleName.MANAGER,
      },
    }));

    const result = await service.createUser({
      firstName: 'Nadia',
      lastName: 'Saidi',
      email: 'nadia.saidi@faculty.test',
      password: 'ChangeMe123!',
      role: CreateUserRole.MANAGER,
      isActive: false,
    });

    const createCall = prisma.user.create.mock.calls[0]?.[0] as {
      data: { status: UserStatus };
    };
    expect(createCall.data.status).toBe(UserStatus.INACTIVE);
    expect(result.isActive).toBe(false);
    expect(result.role).toBe(UserRole.MANAGER);
  });

  it('rejects duplicate email addresses', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.createUser({
        firstName: 'Amina',
        lastName: 'Bennani',
        email: 'amina.bennani@faculty.test',
        password: 'ChangeMe123!',
        role: CreateUserRole.USER,
        isActive: true,
      }),
    ).rejects.toThrow(new ConflictException('Un utilisateur avec cet email existe deja.'));
    expect(prisma.role.upsert).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('deactivates an existing user without deleting it', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: null,
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      status: UserStatus.INACTIVE,
      createdAt: new Date('2026-05-13T15:30:00.000Z'),
      role: {
        name: RoleName.USER,
      },
    });

    const result = await service.deactivateUser('user-1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, deletedAt: true },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { status: UserStatus.INACTIVE },
      include: { role: true },
    });
    expect(result).toEqual({
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      role: UserRole.USER,
      isActive: false,
      createdAt: '2026-05-13T15:30:00.000Z',
    });
  });

  it('rejects deactivation when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.deactivateUser('missing-user')).rejects.toThrow(
      new NotFoundException('Utilisateur introuvable.'),
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects deactivation when the user is already logically deleted', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: new Date('2026-05-13T15:30:00.000Z'),
    });

    await expect(service.deactivateUser('user-1')).rejects.toThrow(
      new NotFoundException('Utilisateur introuvable.'),
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('assigns a valid role to an existing user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: null,
    });
    prisma.role.upsert.mockResolvedValue({
      id: 'role-manager',
      name: RoleName.MANAGER,
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      status: UserStatus.ACTIVE,
      createdAt: new Date('2026-05-13T15:30:00.000Z'),
      role: {
        name: RoleName.MANAGER,
      },
    });

    const result = await service.assignUserRole('user-1', {
      role: AssignUserRole.MANAGER,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, deletedAt: true },
    });
    expect(prisma.role.upsert).toHaveBeenCalledWith({
      where: { name: RoleName.MANAGER },
      update: {},
      create: { name: RoleName.MANAGER },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { roleId: 'role-manager' },
      include: { role: true },
    });
    expect(result).toEqual({
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: '2026-05-13T15:30:00.000Z',
    });
  });

  it('rejects invalid role assignment values', async () => {
    await expect(
      service.assignUserRole('user-1', {
        role: 'SUPPLIER' as AssignUserRole,
      }),
    ).rejects.toThrow(new BadRequestException('Role utilisateur invalide.'));
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects role assignment when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.assignUserRole('missing-user', {
        role: AssignUserRole.USER,
      }),
    ).rejects.toThrow(new NotFoundException('Utilisateur introuvable.'));
    expect(prisma.role.upsert).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects role assignment when the user is logically deleted', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: new Date('2026-05-13T15:30:00.000Z'),
    });

    await expect(
      service.assignUserRole('user-1', {
        role: AssignUserRole.ADMIN,
      }),
    ).rejects.toThrow(new NotFoundException('Utilisateur introuvable.'));
    expect(prisma.role.upsert).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
