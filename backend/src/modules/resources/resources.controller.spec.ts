import 'reflect-metadata';
import { ResourceAssignmentStatus, ResourceStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { ResourceAssignmentHistoryResponseDto } from '../resource-assignments/dto/resource-assignment-read.dto';
import { ResourceAssignmentsService } from '../resource-assignments/resource-assignments.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceCreatedAtSort } from './dto/list-resources-query.dto';
import { ResourceDetailResponseDto } from './dto/resource-detail-response.dto';
import { ResourceListResponseDto } from './dto/resource-list-response.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

const createResourceAssignmentsServiceMock = () =>
  ({
    listResourceAssignmentsByResource: jest.fn(),
  }) as unknown as ResourceAssignmentsService;

const authenticatedRequest: AuthenticatedRequest = {
  user: {
    userId: 'admin-1',
    email: 'admin@grm.local',
    roles: [UserRole.ADMIN],
  },
};

describe('ResourcesController', () => {
  it('delegates resource creation to ResourcesService', async () => {
    const resourceResponse: ResourceResponseDto = {
      id: 'resource-1',
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: '12500',
      status: 'AVAILABLE',
      supplierId: 'supplier-1',
      createdAt: '2026-06-02T16:00:00.000Z',
    };
    const createResourceMock = jest.fn().mockResolvedValue(resourceResponse);
    const resourcesService = {
      getResourceById: jest.fn(),
      listResources: jest.fn(),
      updateResourceStatus: jest.fn(),
      createResource: createResourceMock,
    } as unknown as ResourcesService;
    const controller = new ResourcesController(
      resourcesService,
      createResourceAssignmentsServiceMock(),
    );
    const createResourceDto: CreateResourceDto = {
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: 12500,
      supplierId: 'supplier-1',
    };

    const result = await controller.create(createResourceDto, authenticatedRequest);

    expect(createResourceMock).toHaveBeenCalledWith(
      createResourceDto,
      'admin-1',
    );
    expect(result).toEqual(resourceResponse);
  });

  it('delegates inventory listing to ResourcesService', async () => {
    const listResponse: ResourceListResponseDto = {
      data: [
        {
          id: 'resource-1',
          inventoryCode: 'INV-INFO-2026-0001',
          name: 'Ordinateur portable Dell Latitude 5440',
          category: 'Informatique',
          status: 'AVAILABLE',
          supplierId: 'supplier-1',
          createdAt: '2026-06-02T16:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };
    const listResourcesMock = jest.fn().mockResolvedValue(listResponse);
    const resourcesService = {
      listResources: listResourcesMock,
      getResourceById: jest.fn(),
      updateResourceStatus: jest.fn(),
      createResource: jest.fn(),
    } as unknown as ResourcesService;
    const controller = new ResourcesController(
      resourcesService,
      createResourceAssignmentsServiceMock(),
    );
    const query = {
      page: 1,
      limit: 20,
      name: 'Latitude',
      createdAtSort: ResourceCreatedAtSort.DESC,
    };

    const result = await controller.findAll(query);

    expect(listResourcesMock).toHaveBeenCalledWith(query);
    expect(result).toEqual(listResponse);
  });

  it('delegates resource detail retrieval to ResourcesService', async () => {
    const detailResponse: ResourceDetailResponseDto = {
      id: 'resource-1',
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: '12500',
      status: 'AVAILABLE',
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        status: 'ACTIVE',
      },
      createdAt: '2026-06-02T16:00:00.000Z',
      updatedAt: '2026-06-02T16:00:00.000Z',
    };
    const getResourceByIdMock = jest.fn().mockResolvedValue(detailResponse);
    const resourcesService = {
      getResourceById: getResourceByIdMock,
      listResources: jest.fn(),
      updateResourceStatus: jest.fn(),
      createResource: jest.fn(),
    } as unknown as ResourcesService;
    const controller = new ResourcesController(
      resourcesService,
      createResourceAssignmentsServiceMock(),
    );

    const result = await controller.findOne('resource-1');

    expect(getResourceByIdMock).toHaveBeenCalledWith('resource-1');
    expect(result).toEqual(detailResponse);
  });

  it('delegates resource assignment history retrieval to ResourceAssignmentsService', async () => {
    const historyResponse: ResourceAssignmentHistoryResponseDto = {
      data: [
        {
          id: 'assignment-1',
          resourceId: 'resource-1',
          resourceName: 'Ordinateur portable Dell Latitude 5440',
          inventoryCode: 'INV-INFO-2026-0001',
          userId: 'user-1',
          userFullName: 'Amina Bennani',
          status: ResourceAssignmentStatus.RETURNED,
          assignedAt: '2026-06-03T09:00:00.000Z',
          returnedAt: '2026-06-03T10:00:00.000Z',
          comment: 'Affectation initiale',
          returnComment: 'Retour confirme',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };
    const listResourceAssignmentsByResourceMock = jest
      .fn()
      .mockResolvedValue(historyResponse);
    const resourcesService = {
      getResourceById: jest.fn(),
      listResources: jest.fn(),
      updateResourceStatus: jest.fn(),
      createResource: jest.fn(),
    } as unknown as ResourcesService;
    const resourceAssignmentsService = {
      listResourceAssignmentsByResource: listResourceAssignmentsByResourceMock,
    } as unknown as ResourceAssignmentsService;
    const controller = new ResourcesController(
      resourcesService,
      resourceAssignmentsService,
    );
    const query = {
      page: 1,
      limit: 20,
    };

    const result = await controller.findAssignments('resource-1', query);

    expect(listResourceAssignmentsByResourceMock).toHaveBeenCalledWith(
      'resource-1',
      query,
    );
    expect(result).toEqual(historyResponse);
  });

  it('delegates status update to ResourcesService', async () => {
    const detailResponse: ResourceDetailResponseDto = {
      id: 'resource-1',
      name: 'Ordinateur portable Dell Latitude 5440',
      inventoryCode: 'INV-INFO-2026-0001',
      category: 'Informatique',
      description: 'PC portable destine aux salles informatiques',
      serialNumber: 'SN-DL-5440-2026-001',
      acquisitionDate: '2026-06-02T00:00:00.000Z',
      acquisitionValue: '12500',
      status: ResourceStatus.UNDER_MAINTENANCE,
      supplierId: 'supplier-1',
      supplier: null,
      createdAt: '2026-06-02T16:00:00.000Z',
      updatedAt: '2026-06-03T10:00:00.000Z',
    };
    const updateResourceStatusMock = jest.fn().mockResolvedValue(detailResponse);
    const resourcesService = {
      updateResourceStatus: updateResourceStatusMock,
      getResourceById: jest.fn(),
      listResources: jest.fn(),
      createResource: jest.fn(),
    } as unknown as ResourcesService;
    const controller = new ResourcesController(
      resourcesService,
      createResourceAssignmentsServiceMock(),
    );
    const dto = {
      status: ResourceStatus.UNDER_MAINTENANCE,
    };

    const result = await controller.updateStatus(
      'resource-1',
      dto,
      authenticatedRequest,
    );

    expect(updateResourceStatusMock).toHaveBeenCalledWith(
      'resource-1',
      dto,
      'admin-1',
    );
    expect(result).toEqual(detailResponse);
  });

  it('allows ADMIN and MANAGER roles on the list endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourcesController.prototype,
      'findAll',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected findAll handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('allows ADMIN and MANAGER roles on the detail endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourcesController.prototype,
      'findOne',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected findOne handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('allows ADMIN and MANAGER roles on the update status endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourcesController.prototype,
      'updateStatus',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected updateStatus handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('allows ADMIN and MANAGER roles on the assignment history endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourcesController.prototype,
      'findAssignments',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected findAssignments handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('allows ADMIN and MANAGER roles on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      ResourcesController.prototype,
      'create',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected create handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
