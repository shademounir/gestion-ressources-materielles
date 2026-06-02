import 'reflect-metadata';
import { DepartmentStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentResponseDto } from './dto/department-response.dto';

describe('DepartmentsController', () => {
  it('delegates department creation to DepartmentsService', async () => {
    const departmentResponse: DepartmentResponseDto = {
      id: 'department-1',
      name: 'Informatique',
      description: 'Departement des sciences informatiques',
      status: DepartmentStatus.ACTIVE,
      createdAt: '2026-05-14T09:30:00.000Z',
    };
    const createDepartmentMock = jest.fn().mockResolvedValue(departmentResponse);
    const departmentsService = {
      createDepartment: createDepartmentMock,
    } as unknown as DepartmentsService;
    const controller = new DepartmentsController(departmentsService);
    const createDepartmentDto = {
      name: 'Informatique',
      description: 'Departement des sciences informatiques',
    };

    const result = await controller.create(createDepartmentDto);

    expect(createDepartmentMock).toHaveBeenCalledWith(createDepartmentDto);
    expect(result).toEqual(departmentResponse);
  });

  it('requires ADMIN role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      DepartmentsController.prototype,
      'create',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected create handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN]);
  });
});
