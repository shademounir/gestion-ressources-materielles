import 'reflect-metadata';
import { SupplierStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { SupplierHistoryResponseDto } from './dto/supplier-history-response.dto';
import { SupplierListResponseDto } from './dto/supplier-list-response.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

describe('SuppliersController', () => {
  it('delegates supplier listing to SuppliersService', async () => {
    const supplierList: SupplierListResponseDto = {
      data: [
        {
          id: 'supplier-1',
          name: 'Tech Solutions Maroc',
          contactEmail: 'contact@techsolutions.test',
          phone: '+212 522 000 000',
          address: 'Casablanca, Maroc',
          status: SupplierStatus.ACTIVE,
          createdAt: '2026-06-02T11:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 8,
        total: 1,
        totalPages: 1,
      },
    };
    const query: ListSuppliersQueryDto = {
      page: 1,
      limit: 8,
      search: 'tech',
      status: SupplierStatus.ACTIVE,
    };
    const listSuppliersMock = jest.fn().mockResolvedValue(supplierList);
    const suppliersService = {
      listSuppliers: listSuppliersMock,
    } as unknown as SuppliersService;
    const controller = new SuppliersController(suppliersService);

    const result = await controller.list(query);

    expect(listSuppliersMock).toHaveBeenCalledWith(query);
    expect(result).toEqual(supplierList);
  });

  it('requires ADMIN or MANAGER role on the list endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SuppliersController.prototype,
      'list',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected list handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

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

  it('delegates supplier detail retrieval to SuppliersService', async () => {
    const supplierResponse: SupplierResponseDto = {
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.ACTIVE,
      createdAt: '2026-06-02T11:00:00.000Z',
    };
    const getSupplierByIdMock = jest.fn().mockResolvedValue(supplierResponse);
    const suppliersService = {
      getSupplierById: getSupplierByIdMock,
    } as unknown as SuppliersService;
    const controller = new SuppliersController(suppliersService);

    const result = await controller.getById('supplier-1');

    expect(getSupplierByIdMock).toHaveBeenCalledWith('supplier-1');
    expect(result).toEqual(supplierResponse);
  });

  it('requires ADMIN or MANAGER role on the detail endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SuppliersController.prototype,
      'getById',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected getById handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates supplier history retrieval to SuppliersService', async () => {
    const supplierHistory: SupplierHistoryResponseDto = {
      supplierIdentity: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        address: 'Casablanca, Maroc',
      },
      supplierStatus: SupplierStatus.ACTIVE,
      supplierCreatedAt: '2026-06-02T11:00:00.000Z',
      supplierUpdatedAt: '2026-06-02T11:30:00.000Z',
      offersCount: 0,
      tendersCount: 0,
      maintenanceReturnsCount: 0,
    };
    const getSupplierHistoryMock = jest.fn().mockResolvedValue(supplierHistory);
    const suppliersService = {
      getSupplierHistory: getSupplierHistoryMock,
    } as unknown as SuppliersService;
    const controller = new SuppliersController(suppliersService);

    const result = await controller.getHistory('supplier-1');

    expect(getSupplierHistoryMock).toHaveBeenCalledWith('supplier-1');
    expect(result).toEqual(supplierHistory);
  });

  it('requires ADMIN or MANAGER role on the history endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SuppliersController.prototype,
      'getHistory',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected getHistory handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates supplier deactivation to SuppliersService', async () => {
    const supplierResponse: SupplierResponseDto = {
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: SupplierStatus.INACTIVE,
      createdAt: '2026-06-02T11:00:00.000Z',
    };
    const deactivateSupplierMock = jest.fn().mockResolvedValue(supplierResponse);
    const suppliersService = {
      deactivateSupplier: deactivateSupplierMock,
    } as unknown as SuppliersService;
    const controller = new SuppliersController(suppliersService);

    const result = await controller.deactivate('supplier-1');

    expect(deactivateSupplierMock).toHaveBeenCalledWith('supplier-1');
    expect(result).toEqual(supplierResponse);
  });

  it('requires ADMIN or MANAGER role on the deactivate endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SuppliersController.prototype,
      'deactivate',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected deactivate handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
