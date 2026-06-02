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
  ApiConflictResponse,
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
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateTenderDto } from './dto/create-tender.dto';
import { TenderResponseDto } from './dto/tender-response.dto';
import { TendersService } from './tenders.service';

@ApiTags('tenders')
@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Creer un appel d'offres a partir d'un besoin" })
  @ApiCreatedResponse({ type: TenderResponseDto })
  @ApiBadRequestResponse({ description: 'Payload invalide ou deadline non future' })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: "Role insuffisant pour creer un appel d'offres" })
  @ApiNotFoundResponse({ description: 'Besoin introuvable' })
  @ApiConflictResponse({
    description: "Reference deja utilisee ou appel d'offres actif existant pour ce besoin",
  })
  create(
    @Body() createTenderDto: CreateTenderDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<TenderResponseDto> {
    const createdById = request.user?.userId;

    if (!createdById) {
      throw new UnauthorizedException('Utilisateur non authentifie.');
    }

    return this.tendersService.createTender(createTenderDto, createdById);
  }
}
