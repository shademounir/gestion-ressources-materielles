import { Module } from '@nestjs/common';
import { ResourceAssignmentsModule } from '../resource-assignments/resource-assignments.module';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
  imports: [ResourceAssignmentsModule],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
