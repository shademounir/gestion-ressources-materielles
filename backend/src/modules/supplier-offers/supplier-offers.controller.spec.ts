import 'reflect-metadata';
import { SupplierOfferStatus } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { SupplierOfferResponseDto } from './dto/supplier-offer-response.dto';
import { SupplierOffersController } from './supplier-offers.controller';
import { SupplierOffersService } from './supplier-offers.service';

describe('SupplierOffersController', () => {
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
