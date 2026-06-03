import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ListResourcesQueryDto } from './dto/list-resources-query.dto';
import { ResourceDetailResponseDto } from './dto/resource-detail-response.dto';
import { ResourceListResponseDto } from './dto/resource-list-response.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { UpdateResourceStatusDto } from './dto/update-resource-status.dto';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Consulter l'inventaire des ressources" })
  @ApiOkResponse({ type: ResourceListResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: "Role insuffisant pour consulter l'inventaire" })
  findAll(@Query() query: ListResourcesQueryDto): Promise<ResourceListResponseDto> {
    return this.resourcesService.listResources(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Consulter le detail d'une ressource" })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de la ressource' })
  @ApiOkResponse({ type: ResourceDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour consulter une ressource' })
  @ApiNotFoundResponse({ description: 'Ressource introuvable' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) resourceId: string,
  ): Promise<ResourceDetailResponseDto> {
    return this.resourcesService.getResourceById(resourceId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Modifier le statut d'une ressource" })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de la ressource' })
  @ApiOkResponse({ type: ResourceDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour modifier le statut' })
  @ApiNotFoundResponse({ description: 'Ressource introuvable' })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) resourceId: string,
    @Body() updateResourceStatusDto: UpdateResourceStatusDto,
  ): Promise<ResourceDetailResponseDto> {
    return this.resourcesService.updateResourceStatus(
      resourceId,
      updateResourceStatusDto,
    );
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Enregistrer une ressource materielle' })
  @ApiCreatedResponse({ type: ResourceResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour creer une ressource' })
  @ApiConflictResponse({ description: 'Reference inventaire deja utilisee' })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  create(@Body() createResourceDto: CreateResourceDto): Promise<ResourceResponseDto> {
    return this.resourcesService.createResource(createResourceDto);
  }
}
