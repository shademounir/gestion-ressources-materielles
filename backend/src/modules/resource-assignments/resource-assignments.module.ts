import { Module } from '@nestjs/common';
import { ResourceAssignmentsController } from './resource-assignments.controller';
import { ResourceAssignmentsService } from './resource-assignments.service';

@Module({
  controllers: [ResourceAssignmentsController],
  providers: [ResourceAssignmentsService],
  exports: [ResourceAssignmentsService],
})
export class ResourceAssignmentsModule {}
