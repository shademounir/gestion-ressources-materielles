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
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { SupplierHistoryResponseDto } from './dto/supplier-history-response.dto';
import { SupplierListResponseDto } from './dto/supplier-list-response.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Lister les fournisseurs' })
  @ApiOkResponse({ type: SupplierListResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour lister les fournisseurs' })
  list(@Query() query: ListSuppliersQueryDto): Promise<SupplierListResponseDto> {
    return this.suppliersService.listSuppliers(query);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Referencer un fournisseur' })
  @ApiCreatedResponse({ type: SupplierResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour creer un fournisseur' })
  @ApiConflictResponse({ description: 'Nom ou email fournisseur deja utilise' })
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.suppliersService.createSupplier(createSupplierDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Consulter un fournisseur' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du fournisseur' })
  @ApiOkResponse({ type: SupplierResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour consulter un fournisseur' })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) supplierId: string,
  ): Promise<SupplierResponseDto> {
    return this.suppliersService.getSupplierById(supplierId);
  }

  @Get(':id/history')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Consulter l'historique d'un fournisseur" })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du fournisseur' })
  @ApiOkResponse({ type: SupplierHistoryResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: "Role insuffisant pour consulter l'historique" })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  getHistory(
    @Param('id', new ParseUUIDPipe({ version: '4' })) supplierId: string,
  ): Promise<SupplierHistoryResponseDto> {
    return this.suppliersService.getSupplierHistory(supplierId);
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Desactiver un fournisseur sans suppression physique' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID du fournisseur' })
  @ApiOkResponse({ type: SupplierResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour desactiver un fournisseur' })
  @ApiNotFoundResponse({ description: 'Fournisseur introuvable' })
  deactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) supplierId: string,
  ): Promise<SupplierResponseDto> {
    return this.suppliersService.deactivateSupplier(supplierId);
  }
}
