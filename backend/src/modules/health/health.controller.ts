import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { HealthValidationDto } from './health-validation.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check() {
    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'connected',
      service: 'gestion-ressources-materielles-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('validation')
  validatePayload(@Body() payload: HealthValidationDto) {
    return {
      status: 'validated',
      echo: payload.name,
    };
  }
}
