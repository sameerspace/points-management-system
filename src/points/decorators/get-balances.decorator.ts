import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetBalances() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current balances',
      description: 'Get current balance for all payers',
    }),
    ApiResponse({
      status: 200,
      description: 'Current balances for all payers',
      schema: {
        type: 'object',
        additionalProperties: { type: 'number' },
        example: { SHOPIFY: 1000, EBAY: 0, AMAZON: 5300 },
      },
    }),
  );
}
