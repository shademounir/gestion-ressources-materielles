import 'reflect-metadata';
import { SupplierStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

describe('SuppliersController', () => {
  it('delegates supplier creation to SuppliersService', async () => {
    const supplierResponse: SupplierResponseDto = {
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: '2026-06-02T11:00:00.000Z',
    };
    const createSupplierMock = jest.fn().mockResolvedValue(supplierResponse);
    const suppliersService = {
      createSupplier: createSupplierMock,
    } as unknown as SuppliersService;
    const controller = new SuppliersController(suppliersService);
    const createSupplierDto = {
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
    };

    const result = await controller.create(createSupplierDto);

    expect(createSupplierMock).toHaveBeenCalledWith(createSupplierDto);
    expect(result).toEqual(supplierResponse);
  });

  it('requires ADMIN or MANAGER role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SuppliersController.prototype,
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
