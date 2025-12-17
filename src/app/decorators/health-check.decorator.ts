import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiHealthCheck() {
  return applyDecorators(
    ApiOperation({
      summary: 'Health check',
      description:
        'Returns a simple hello message to verify the API is running',
    }),
    ApiResponse({
      status: 200,
      description: 'API is running',
      schema: {
        type: 'string',
        example: 'Hello World!',
      },
    }),
  );
}
