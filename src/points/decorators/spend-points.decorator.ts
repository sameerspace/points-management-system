import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SpendResponseDto } from '../dto/spend-response.dto';

export function ApiSpendPoints() {
  return applyDecorators(
    ApiOperation({
      summary: 'Spend points',
      description:
        'Spend points following the rules: oldest points first, no payer goes negative. Returns an array of point deductions per payer.',
    }),
    ApiResponse({
      status: 200,
      description: 'Points successfully spent',
      type: [SpendResponseDto],
    }),
    ApiBadRequestResponse({
      description: 'Invalid request (e.g., not enough points, negative points)',
    }),
  );
}
