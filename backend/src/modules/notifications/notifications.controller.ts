import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
  NotificationUnreadCountResponseDto,
} from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Consulter les notifications de l'utilisateur connecte" })
  @ApiOkResponse({ type: NotificationListResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  findAll(
    @Query() query: ListNotificationsQueryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<NotificationListResponseDto> {
    return this.notificationsService.listNotifications(
      this.getAuthenticatedUserId(request),
      query,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Compter les notifications non lues' })
  @ApiOkResponse({ type: NotificationUnreadCountResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  getUnreadCount(
    @Req() request: AuthenticatedRequest,
  ): Promise<NotificationUnreadCountResponseDto> {
    return this.notificationsService.getUnreadCount(
      this.getAuthenticatedUserId(request),
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de la notification' })
  @ApiOkResponse({ type: NotificationResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiNotFoundResponse({ description: 'Notification introuvable' })
  markAsRead(
    @Param('id', new ParseUUIDPipe({ version: '4' })) notificationId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(
      notificationId,
      this.getAuthenticatedUserId(request),
    );
  }

  private getAuthenticatedUserId(request: AuthenticatedRequest): string {
    if (!request.user?.userId) {
      throw new UnauthorizedException('Utilisateur authentifie introuvable.');
    }

    return request.user.userId;
  }
}
