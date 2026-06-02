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
import { CreateSupplierOfferDto } from './dto/create-supplier-offer.dto';
import { SupplierOfferResponseDto } from './dto/supplier-offer-response.dto';
import { SupplierOffersService } from './supplier-offers.service';

@ApiTags('supplier-offers')
@Controller('supplier-offers')
export class SupplierOffersController {
  constructor(private readonly supplierOffersService: SupplierOffersService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Enregistrer une offre fournisseur sur un appel d'offres publie" })
  @ApiCreatedResponse({ type: SupplierOfferResponseDto })
  @ApiBadRequestResponse({
    description: "Tender non publie, expire ou fournisseur inactif",
  })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour enregistrer une offre' })
  @ApiNotFoundResponse({ description: 'Appel d offres ou fournisseur introuvable' })
  @ApiConflictResponse({ description: 'Offre fournisseur deja existante pour cet appel d offres' })
  create(
    @Body() createSupplierOfferDto: CreateSupplierOfferDto,
  ): Promise<SupplierOfferResponseDto> {
    return this.supplierOffersService.createSupplierOffer(createSupplierOfferDto);
  }
}
