import { ApiProperty, PickType } from '@nestjs/swagger';
import { DepartmentNeedResponseDto } from './department-need-response.dto';

export class DepartmentNeedListItemResponseDto extends PickType(
  DepartmentNeedResponseDto,
  [
    'id',
    'title',
    'priority',
    'status',
    'departmentId',
    'createdById',
    'createdAt',
    'updatedAt',
  ] as const,
) {}

export class DepartmentNeedListMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class DepartmentNeedListResponseDto {
  @ApiProperty({ type: [DepartmentNeedListItemResponseDto] })
  data!: DepartmentNeedListItemResponseDto[];

  @ApiProperty({ type: DepartmentNeedListMetaResponseDto })
  meta!: DepartmentNeedListMetaResponseDto;
}

export class DepartmentNeedDepartmentResponseDto {
  @ApiProperty({ example: 'f6a9ad3d-7d4f-4ed6-b4c8-4a66b3b47d2b' })
  id!: string;

  @ApiProperty({ example: 'Informatique' })
  name!: string;
}

export class DepartmentNeedRequesterResponseDto {
  @ApiProperty({ example: '3d15d575-fd17-446f-94f3-c5560e557f50' })
  id!: string;

  @ApiProperty({ example: 'Demo' })
  firstName!: string;

  @ApiProperty({ example: 'Manager' })
  lastName!: string;

  @ApiProperty({ example: 'manager@grm.local' })
  email!: string;
}

export class DepartmentNeedDetailResponseDto extends DepartmentNeedResponseDto {
  @ApiProperty({ type: DepartmentNeedDepartmentResponseDto })
  department!: DepartmentNeedDepartmentResponseDto;

  @ApiProperty({ type: DepartmentNeedRequesterResponseDto })
  createdBy!: DepartmentNeedRequesterResponseDto;
}
