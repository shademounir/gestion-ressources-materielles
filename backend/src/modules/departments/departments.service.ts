import { ConflictException, Injectable } from '@nestjs/common';
import { Department, DepartmentStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const name = createDepartmentDto.name.trim();
    const description = createDepartmentDto.description?.trim() || null;
    const existingDepartment = await this.prisma.department.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (existingDepartment) {
      throw new ConflictException('Un departement avec ce nom existe deja.');
    }

    const createdDepartment = await this.prisma.department.create({
      data: {
        name,
        description,
        status: DepartmentStatus.ACTIVE,
      },
    });

    return this.toDepartmentResponse(createdDepartment);
  }

  private toDepartmentResponse(department: Department): DepartmentResponseDto {
    return {
      id: department.id,
      name: department.name,
      description: department.description,
      status: department.status,
      createdAt: department.createdAt.toISOString(),
    };
  }
}
