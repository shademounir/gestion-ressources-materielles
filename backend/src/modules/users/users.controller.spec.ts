import 'reflect-metadata';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AssignUserRole } from './dto/assign-user-role.dto';
import { CreateUserRole } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  it('delegates user creation to UsersService', async () => {
    const userResponse: UserResponseDto = {
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      role: UserRole.USER,
      isActive: true,
      createdAt: '2026-05-13T15:30:00.000Z',
    };
    const createUserMock = jest.fn().mockResolvedValue(userResponse);
    const usersService = {
      createUser: createUserMock,
      getFoundationStatus: jest.fn(),
    } as unknown as UsersService;
    const controller = new UsersController(usersService);
    const createUserDto = {
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      password: 'ChangeMe123!',
      role: CreateUserRole.USER,
      isActive: true,
    };

    const result = await controller.create(createUserDto);

    expect(createUserMock).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(userResponse);
  });

  it('requires ADMIN role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(UsersController.prototype, 'create');
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected create handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN]);
  });

  it('delegates user deactivation to UsersService', async () => {
    const userResponse: UserResponseDto = {
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      role: UserRole.USER,
      isActive: false,
      createdAt: '2026-05-13T15:30:00.000Z',
    };
    const deactivateUserMock = jest.fn().mockResolvedValue(userResponse);
    const usersService = {
      deactivateUser: deactivateUserMock,
      createUser: jest.fn(),
      getFoundationStatus: jest.fn(),
    } as unknown as UsersService;
    const controller = new UsersController(usersService);

    const result = await controller.deactivate('user-1');

    expect(deactivateUserMock).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(userResponse);
  });

  it('requires ADMIN role on the deactivate endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      UsersController.prototype,
      'deactivate',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected deactivate handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN]);
  });

  it('delegates role assignment to UsersService', async () => {
    const userResponse: UserResponseDto = {
      id: 'user-1',
      firstName: 'Amina',
      lastName: 'Bennani',
      email: 'amina.bennani@faculty.test',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: '2026-05-13T15:30:00.000Z',
    };
    const assignUserRoleMock = jest.fn().mockResolvedValue(userResponse);
    const usersService = {
      assignUserRole: assignUserRoleMock,
      deactivateUser: jest.fn(),
      createUser: jest.fn(),
      getFoundationStatus: jest.fn(),
    } as unknown as UsersService;
    const controller = new UsersController(usersService);
    const assignUserRoleDto = {
      role: AssignUserRole.MANAGER,
    };

    const result = await controller.assignRole('user-1', assignUserRoleDto);

    expect(assignUserRoleMock).toHaveBeenCalledWith('user-1', assignUserRoleDto);
    expect(result).toEqual(userResponse);
  });

  it('requires ADMIN role on the assign role endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      UsersController.prototype,
      'assignRole',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected assignRole handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN]);
  });
});
