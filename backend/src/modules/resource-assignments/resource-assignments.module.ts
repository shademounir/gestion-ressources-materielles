import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ResourceAssignmentsController } from './resource-assignments.controller';
import { ResourceAssignmentsService } from './resource-assignments.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ResourceAssignmentsController],
  providers: [ResourceAssignmentsService],
  exports: [ResourceAssignmentsService],
})
export class ResourceAssignmentsModule {}
