import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateTenderDto } from './dto/create-tender.dto';
import { ListTendersQueryDto } from './dto/list-tenders-query.dto';
import { TenderDetailResponseDto } from './dto/tender-detail-response.dto';
import { TenderListResponseDto } from './dto/tender-list-response.dto';
import { TenderResponseDto } from './dto/tender-response.dto';
import { TendersService } from './tenders.service';

@ApiTags('tenders')
@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Lister les appels d'offres" })
  @ApiOkResponse({ type: TenderListResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: "Role insuffisant pour lister les appels d'offres" })
  list(@Query() query: ListTendersQueryDto): Promise<TenderListResponseDto> {
    return this.tendersService.listTenders(query);
  }

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

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Consulter un appel d'offres" })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'appel d'offres" })
  @ApiOkResponse({ type: TenderDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: "Role insuffisant pour consulter un appel d'offres" })
  @ApiNotFoundResponse({ description: "Appel d'offres introuvable" })
  getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) tenderId: string,
  ): Promise<TenderDetailResponseDto> {
    return this.tendersService.getTenderById(tenderId);
  }

  @Patch(':id/publish')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Publier un appel d'offres en brouillon" })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'appel d'offres" })
  @ApiOkResponse({ type: TenderResponseDto })
  @ApiBadRequestResponse({ description: 'Statut invalide ou deadline expiree' })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: "Role insuffisant pour publier un appel d'offres" })
  @ApiNotFoundResponse({ description: "Appel d'offres introuvable" })
  publish(
    @Param('id', new ParseUUIDPipe({ version: '4' })) tenderId: string,
  ): Promise<TenderResponseDto> {
    return this.tendersService.publishTender(tenderId);
  }
}
