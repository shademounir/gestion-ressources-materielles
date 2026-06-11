import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ResourceAssignmentsController } from './resource-assignments.controller';
import { ResourceAssignmentsService } from './resource-assignments.service';

@Module({
  imports: [AuditLogsModule, NotificationsModule],
  controllers: [ResourceAssignmentsController],
  providers: [ResourceAssignmentsService],
  exports: [ResourceAssignmentsService],
})
export class ResourceAssignmentsModule {}
