import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
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
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-user.interface';
import { CreateResourceAssignmentDto } from './dto/create-resource-assignment.dto';
import { ResourceAssignmentDetailDto } from './dto/resource-assignment-read.dto';
import { ResourceAssignmentResponseDto } from './dto/resource-assignment-response.dto';
import { ReturnResourceAssignmentDto } from './dto/return-resource-assignment.dto';
import { ResourceAssignmentsService } from './resource-assignments.service';

@ApiTags('resource-assignments')
@Controller('resource-assignments')
export class ResourceAssignmentsController {
  constructor(
    private readonly resourceAssignmentsService: ResourceAssignmentsService,
  ) {}

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Consulter le detail d'une affectation" })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'affectation" })
  @ApiOkResponse({ type: ResourceAssignmentDetailDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour consulter une affectation' })
  @ApiNotFoundResponse({ description: 'Affectation introuvable' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) assignmentId: string,
  ): Promise<ResourceAssignmentDetailDto> {
    return this.resourceAssignmentsService.getAssignmentById(assignmentId);
  }

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
    @Req() request: AuthenticatedRequest,
  ): Promise<ResourceAssignmentResponseDto> {
    return this.resourceAssignmentsService.assignResource(
      createResourceAssignmentDto,
      request.user?.userId,
    );
  }

  @Patch(':id/return')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Retourner une ressource affectee' })
  @ApiParam({ name: 'id', description: "Identifiant UUID de l'affectation" })
  @ApiOkResponse({ type: ResourceAssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Affectation non active ou ressource non affectee',
  })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour retourner une ressource' })
  @ApiNotFoundResponse({ description: 'Affectation ou ressource introuvable' })
  returnResource(
    @Param('id', new ParseUUIDPipe({ version: '4' })) assignmentId: string,
    @Body() returnResourceAssignmentDto: ReturnResourceAssignmentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ResourceAssignmentResponseDto> {
    return this.resourceAssignmentsService.returnResource(
      assignmentId,
      returnResourceAssignmentDto,
      request.user?.userId,
    );
  }
}
