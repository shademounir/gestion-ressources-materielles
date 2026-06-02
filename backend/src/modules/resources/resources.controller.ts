import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
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
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

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
