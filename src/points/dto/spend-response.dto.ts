import { ApiProperty } from '@nestjs/swagger';

export class SpendResponseDto {
  @ApiProperty({
    description: 'The name of the payer',
    example: 'SHOPIFY',
  })
  payer: string;

  @ApiProperty({
    description:
      'The number of points deducted from this payer (negative value)',
    example: -100,
  })
  points: number;
}
