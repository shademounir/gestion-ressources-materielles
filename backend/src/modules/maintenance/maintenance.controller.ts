import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { CreateMaintenanceTicketDto } from './dto/create-maintenance-ticket.dto';
import { MaintenanceTicketResponseDto } from './dto/maintenance-ticket-response.dto';
import { MaintenanceService } from './maintenance.service';

@ApiTags('maintenance-tickets')
@Controller('maintenance-tickets')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Signaler une panne sur une ressource' })
  @ApiCreatedResponse({ type: MaintenanceTicketResponseDto })
  @ApiBadRequestResponse({
    description: 'Ressource archivee ou deja en maintenance',
  })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour signaler une panne' })
  @ApiNotFoundResponse({ description: 'Ressource ou utilisateur declarant introuvable' })
  create(
    @Body() createMaintenanceTicketDto: CreateMaintenanceTicketDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<MaintenanceTicketResponseDto> {
    const reportedById = request.user?.userId;

    if (!reportedById) {
      throw new UnauthorizedException('Utilisateur non authentifie.');
    }

    return this.maintenanceService.reportFailure(
      createMaintenanceTicketDto,
      reportedById,
    );
  }
}
