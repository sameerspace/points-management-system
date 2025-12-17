import { ApiProperty } from '@nestjs/swagger';

export class SpendPointsDto {
  @ApiProperty({
    description: 'The number of points to spend',
    example: 5000,
    minimum: 0,
  })
  points: number;
}
