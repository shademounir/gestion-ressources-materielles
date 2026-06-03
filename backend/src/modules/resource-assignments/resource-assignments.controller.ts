import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateResourceAssignmentDto } from './dto/create-resource-assignment.dto';
import { ResourceAssignmentResponseDto } from './dto/resource-assignment-response.dto';
import { ResourceAssignmentsService } from './resource-assignments.service';

@ApiTags('resource-assignments')
@Controller('resource-assignments')
export class ResourceAssignmentsController {
  constructor(
    private readonly resourceAssignmentsService: ResourceAssignmentsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Affecter une ressource disponible a un utilisateur' })
  @ApiCreatedResponse({ type: ResourceAssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Ressource non disponible ou utilisateur inactif',
  })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour affecter une ressource' })
  @ApiConflictResponse({ description: 'Affectation active deja existante' })
  @ApiNotFoundResponse({ description: 'Ressource ou utilisateur introuvable' })
  create(
    @Body() createResourceAssignmentDto: CreateResourceAssignmentDto,
  ): Promise<ResourceAssignmentResponseDto> {
    return this.resourceAssignmentsService.assignResource(
      createResourceAssignmentDto,
    );
  }
}
