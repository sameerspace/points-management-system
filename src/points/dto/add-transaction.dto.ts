import { ApiProperty } from '@nestjs/swagger';

export class AddTransactionDto {
  @ApiProperty({
    description: 'The name of the payer',
    example: 'SHOPIFY',
  })
  payer: string;

  @ApiProperty({
    description: 'The number of points (can be positive or negative)',
    example: 1000,
  })
  points: number;

  @ApiProperty({
    description: 'The timestamp of the transaction in ISO 8601 format',
    example: '2024-07-02T14:00:00Z',
  })
  timestamp: string;
}
