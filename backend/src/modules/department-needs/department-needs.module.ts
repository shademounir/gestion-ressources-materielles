import { Module } from '@nestjs/common';
import { DepartmentNeedsController } from './department-needs.controller';
import { DepartmentNeedsService } from './department-needs.service';

@Module({
  controllers: [DepartmentNeedsController],
  providers: [DepartmentNeedsService],
  exports: [DepartmentNeedsService],
})
export class DepartmentNeedsModule {}
