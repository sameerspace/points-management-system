import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'The name of the payer',
    example: 'SHOPIFY',
  })
  payer: string;

  @ApiProperty({
    description: 'The number of points',
    example: 1000,
  })
  points: number;

  @ApiProperty({
    description: 'The timestamp of the transaction',
    example: '2024-07-02T14:00:00.000Z',
    type: Date,
  })
  timestamp: Date;
}
