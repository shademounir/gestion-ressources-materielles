import { Module } from '@nestjs/common';
import { SupplierOffersModule } from '../supplier-offers/supplier-offers.module';
import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';

@Module({
  imports: [SupplierOffersModule],
  controllers: [TendersController],
  providers: [TendersService],
  exports: [TendersService],
})
export class TendersModule {}
