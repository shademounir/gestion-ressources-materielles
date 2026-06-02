import 'reflect-metadata';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

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
      createResource: createResourceMock,
    } as unknown as ResourcesService;
    const controller = new ResourcesController(resourcesService);
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

    const result = await controller.create(createResourceDto);

    expect(createResourceMock).toHaveBeenCalledWith(createResourceDto);
    expect(result).toEqual(resourceResponse);
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
