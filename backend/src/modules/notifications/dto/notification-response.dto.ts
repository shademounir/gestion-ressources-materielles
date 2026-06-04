import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEntityType, NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ example: '4c6e7d2b-0f54-48f4-8f5f-93ecf7f3f2aa' })
  id!: string;

  @ApiPropertyOptional({
    example: '2b55a9cf-2d78-412d-a132-5e1a8a0a6b77',
    nullable: true,
  })
  recipientId!: string | null;

  @ApiProperty({ enum: NotificationType, example: NotificationType.RESOURCE_ASSIGNED })
  type!: NotificationType;

  @ApiProperty({ example: 'Ressource affectee' })
  title!: string;

  @ApiProperty({
    example: 'Une ressource materielle a ete affectee a un utilisateur.',
  })
  message!: string;

  @ApiProperty({
    enum: NotificationEntityType,
    example: NotificationEntityType.RESOURCE_ASSIGNMENT,
  })
  entityType!: NotificationEntityType;

  @ApiProperty({ example: 'resource-assignment-1' })
  entityId!: string;

  @ApiPropertyOptional({ example: '2026-06-04T09:20:00.000Z', nullable: true })
  readAt!: string | null;

  @ApiProperty({ example: '2026-06-04T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-04T09:00:00.000Z' })
  updatedAt!: string;
}

export class NotificationListMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data!: NotificationResponseDto[];

  @ApiProperty({ type: NotificationListMetaResponseDto })
  meta!: NotificationListMetaResponseDto;
}

export class NotificationUnreadCountResponseDto {
  @ApiProperty({ example: 4 })
  unreadCount!: number;
}
