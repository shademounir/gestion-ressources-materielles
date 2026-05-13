import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
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
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('foundation')
  foundation() {
    return this.usersService.getFoundationStatus();
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Creer un utilisateur par un administrateur' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour creer un utilisateur' })
  @ApiConflictResponse({ description: 'Email deja utilise' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Desactiver logiquement un utilisateur' })
  @ApiParam({ name: 'id', description: 'Identifiant UUID de l utilisateur' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'JWT absent, invalide ou expire' })
  @ApiForbiddenResponse({ description: 'Role insuffisant pour desactiver un utilisateur' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  deactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.deactivateUser(id);
  }
}
