import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
import { DepartmentNeedsService } from './department-needs.service';
import { CreateDepartmentNeedDto } from './dto/create-department-need.dto';
import {
  DepartmentNeedDetailResponseDto,
  DepartmentNeedListResponseDto,
} from './dto/department-need-read-response.dto';
import { DepartmentNeedResponseDto } from './dto/department-need-response.dto';
import { ListDepartmentNeedsQueryDto } from './dto/list-department-needs-query.dto';

@ApiTags('department-needs')
@Controller('department-needs')
export class DepartmentNeedsController {
  constructor(private readonly departmentNeedsService: DepartmentNeedsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Lister les besoins departementaux' })
  @ApiOkResponse({ type: DepartmentNeedListResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour lister les besoins' })
  list(
    @Query() query: ListDepartmentNeedsQueryDto,
  ): Promise<DepartmentNeedListResponseDto> {
    return this.departmentNeedsService.listDepartmentNeeds(query);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Declarer un besoin departemental structure' })
  @ApiCreatedResponse({ type: DepartmentNeedResponseDto })
  @ApiBadRequestResponse({ description: 'Payload invalide ou aucune ligne de besoin' })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour declarer un besoin' })
  @ApiNotFoundResponse({ description: 'Departement ou utilisateur createur introuvable' })
  create(
    @Body() createDepartmentNeedDto: CreateDepartmentNeedDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<DepartmentNeedResponseDto> {
    const createdById = request.user?.userId;

    if (!createdById) {
      throw new UnauthorizedException('Utilisateur non authentifie.');
    }

    return this.departmentNeedsService.createDepartmentNeed(
      createDepartmentNeedDto,
      createdById,
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Consulter un besoin departemental' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du besoin' })
  @ApiOkResponse({ type: DepartmentNeedDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour consulter le besoin' })
  @ApiNotFoundResponse({ description: 'Besoin introuvable' })
  getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) needId: string,
  ): Promise<DepartmentNeedDetailResponseDto> {
    return this.departmentNeedsService.getDepartmentNeedById(needId);
  }
}
