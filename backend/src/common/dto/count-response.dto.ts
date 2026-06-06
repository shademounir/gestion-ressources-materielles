import { ApiProperty } from '@nestjs/swagger';

export class CountResponseDto {
  @ApiProperty({ example: 3 })
  count!: number;
}
