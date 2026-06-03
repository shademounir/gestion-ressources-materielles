import 'reflect-metadata';
import { ResourceAssignmentStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateResourceAssignmentDto } from './dto/create-resource-assignment.dto';
import { ResourceAssignmentResponseDto } from './dto/resource-assignment-response.dto';
import { ResourceAssignmentsController } from './resource-assignments.controller';
import { ResourceAssignmentsService } from './resource-assignments.service';

describe('ResourceAssignmentsController', () => {
  it('delegates resource assignment to ResourceAssignmentsService', async () => {
    const assignmentResponse: ResourceAssignmentResponseDto = {
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: null,
      status: ResourceAssignmentStatus.ACTIVE,
      comment: 'Affectation pour le laboratoire informatique',
      returnComment: null,
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T09:00:00.000Z',
    };
    const assignResourceMock = jest.fn().mockResolvedValue(assignmentResponse);
    const resourceAssignmentsService = {
      assignResource: assignResourceMock,
      returnResource: jest.fn(),
    } as unknown as ResourceAssignmentsService;
    const controller = new ResourceAssignmentsController(
      resourceAssignmentsService,
    );
    const dto: CreateResourceAssignmentDto = {
      resourceId: 'resource-1',
      userId: 'user-1',
      comment: 'Affectation pour le laboratoire informatique',
    };

    const result = await controller.create(dto);

    expect(assignResourceMock).toHaveBeenCalledWith(dto);
    expect(result).toEqual(assignmentResponse);
  });

  it('delegates resource return to ResourceAssignmentsService', async () => {
    const assignmentResponse: ResourceAssignmentResponseDto = {
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: '2026-06-03T10:00:00.000Z',
      status: ResourceAssignmentStatus.RETURNED,
      comment: 'Affectation pour le laboratoire informatique',
      returnComment: 'Ressource retournee en bon etat',
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T10:00:00.000Z',
    };
    const returnResourceMock = jest.fn().mockResolvedValue(assignmentResponse);
    const resourceAssignmentsService = {
      assignResource: jest.fn(),
      returnResource: returnResourceMock,
    } as unknown as ResourceAssignmentsService;
    const controller = new ResourceAssignmentsController(
      resourceAssignmentsService,
    );
    const dto = {
      returnComment: 'Ressource retournee en bon etat',
    };

    const result = await controller.returnResource('assignment-1', dto);

    expect(returnResourceMock).toHaveBeenCalledWith('assignment-1', dto);
    expect(result).toEqual(assignmentResponse);
  });

  it('allows ADMIN and MANAGER roles on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourceAssignmentsController.prototype,
      'create',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected create handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('allows ADMIN and MANAGER roles on the return endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourceAssignmentsController.prototype,
      'returnResource',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected returnResource handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
