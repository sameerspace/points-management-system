import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

export function ApiAddTransaction() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a transaction',
      description:
        'Add a new transaction for a specific payer. Points can be positive (add) or negative (subtract).',
    }),
    ApiResponse({
      status: 201,
      description: 'Transaction successfully added',
      type: TransactionResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request body',
    }),
  );
}
