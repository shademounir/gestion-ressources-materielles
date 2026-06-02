import { Module } from '@nestjs/common';
import { SupplierOffersController } from './supplier-offers.controller';
import { SupplierOffersService } from './supplier-offers.service';

@Module({
  controllers: [SupplierOffersController],
  providers: [SupplierOffersService],
  exports: [SupplierOffersService],
})
export class SupplierOffersModule {}
