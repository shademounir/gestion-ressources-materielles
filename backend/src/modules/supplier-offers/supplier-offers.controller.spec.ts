import 'reflect-metadata';
import { SupplierOfferStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ListSupplierOffersQueryDto } from './dto/list-supplier-offers-query.dto';
import {
  SupplierOfferDetailResponseDto,
  SupplierOfferListResponseDto,
} from './dto/supplier-offer-read-response.dto';
import { SupplierOfferResponseDto } from './dto/supplier-offer-response.dto';
import { SupplierOffersController } from './supplier-offers.controller';
import { SupplierOffersService } from './supplier-offers.service';

describe('SupplierOffersController', () => {
  it('delegates supplier offer listing to SupplierOffersService', async () => {
    const supplierOfferList: SupplierOfferListResponseDto = {
      data: [
        {
          id: 'offer-1',
          tenderId: 'tender-1',
          supplierId: 'supplier-1',
          amount: 125000,
          proposedDeliveryDays: 30,
          comment: 'Livraison possible en deux lots.',
          status: SupplierOfferStatus.SUBMITTED,
          submittedAt: '2026-06-02T14:00:00.000Z',
          selectedAt: null,
          createdAt: '2026-06-02T14:00:00.000Z',
          updatedAt: '2026-06-02T14:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 8,
        total: 1,
        totalPages: 1,
      },
    };
    const query: ListSupplierOffersQueryDto = {
      page: 1,
      limit: 8,
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      status: SupplierOfferStatus.SUBMITTED,
    };
    const listSupplierOffersMock = jest.fn().mockResolvedValue(supplierOfferList);
    const supplierOffersService = {
      listSupplierOffers: listSupplierOffersMock,
    } as unknown as SupplierOffersService;
    const controller = new SupplierOffersController(supplierOffersService);

    const result = await controller.list(query);

    expect(listSupplierOffersMock).toHaveBeenCalledWith(query);
    expect(result).toEqual(supplierOfferList);
  });

  it('requires ADMIN or MANAGER role on the list endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SupplierOffersController.prototype,
      'list',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected list handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates supplier offer creation to SupplierOffersService', async () => {
    const supplierOfferResponse: SupplierOfferResponseDto = {
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: '2026-06-02T14:00:00.000Z',
      selectedAt: null,
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T14:00:00.000Z',
    };
    const createSupplierOfferMock = jest.fn().mockResolvedValue(supplierOfferResponse);
    const supplierOffersService = {
      createSupplierOffer: createSupplierOfferMock,
    } as unknown as SupplierOffersService;
    const controller = new SupplierOffersController(supplierOffersService);
    const dto = {
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
    };

    const result = await controller.create(dto);

    expect(createSupplierOfferMock).toHaveBeenCalledWith(dto);
    expect(result).toEqual(supplierOfferResponse);
  });

  it('requires ADMIN or MANAGER role on the create endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SupplierOffersController.prototype,
      'create',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected create handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates supplier offer detail retrieval to SupplierOffersService', async () => {
    const supplierOfferDetail: SupplierOfferDetailResponseDto = {
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SUBMITTED,
      submittedAt: '2026-06-02T14:00:00.000Z',
      selectedAt: null,
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T14:00:00.000Z',
      tender: {
        id: 'tender-1',
        reference: 'AO-20260602-0001',
        title: 'Appel d offres - Equipement salle informatique',
        status: 'PUBLISHED',
        deadline: '2026-07-15T12:00:00.000Z',
      },
      supplier: {
        id: 'supplier-1',
        name: 'Tech Solutions Maroc',
        contactEmail: 'contact@techsolutions.test',
        phone: '+212 522 000 000',
        status: 'ACTIVE',
      },
    };
    const getSupplierOfferByIdMock = jest.fn().mockResolvedValue(supplierOfferDetail);
    const supplierOffersService = {
      getSupplierOfferById: getSupplierOfferByIdMock,
    } as unknown as SupplierOffersService;
    const controller = new SupplierOffersController(supplierOffersService);

    const result = await controller.getById('offer-1');

    expect(getSupplierOfferByIdMock).toHaveBeenCalledWith('offer-1');
    expect(result).toEqual(supplierOfferDetail);
  });

  it('requires ADMIN or MANAGER role on the detail endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SupplierOffersController.prototype,
      'getById',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected getById handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });

  it('delegates supplier offer selection to SupplierOffersService', async () => {
    const supplierOfferResponse: SupplierOfferResponseDto = {
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: SupplierOfferStatus.SELECTED,
      submittedAt: '2026-06-02T14:00:00.000Z',
      selectedAt: '2026-06-02T15:00:00.000Z',
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T15:00:00.000Z',
    };
    const selectSupplierOfferMock = jest.fn().mockResolvedValue(supplierOfferResponse);
    const supplierOffersService = {
      selectSupplierOffer: selectSupplierOfferMock,
    } as unknown as SupplierOffersService;
    const controller = new SupplierOffersController(supplierOffersService);

    const result = await controller.select('offer-1');

    expect(selectSupplierOfferMock).toHaveBeenCalledWith('offer-1');
    expect(result).toEqual(supplierOfferResponse);
  });

  it('requires ADMIN or MANAGER role on the select endpoint', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SupplierOffersController.prototype,
      'select',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected select handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
