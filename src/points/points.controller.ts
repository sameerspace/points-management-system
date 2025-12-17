import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { PointsService } from './points.service';
import { AddTransactionDto } from './dto/add-transaction.dto';
import { SpendPointsDto } from './dto/spend-points.dto';
import { SpendResponseDto } from './dto/spend-response.dto';
import type { Transaction } from './interfaces/transaction.interface';

@ApiTags('points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  @ApiOperation({
    summary: 'Add a transaction',
    description:
      'Add a new transaction for a specific payer. Points can be positive (add) or negative (subtract).',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction successfully added',
    schema: {
      type: 'object',
      properties: {
        payer: { type: 'string', example: 'SHOPIFY' },
        points: { type: 'number', example: 1000 },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-07-02T14:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  addTransaction(@Body() addTransactionDto: AddTransactionDto): Transaction {
    return this.pointsService.addTransaction(addTransactionDto);
  }

  @Post('spend')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Spend points',
    description:
      'Spend points following the rules: oldest points first, no payer goes negative. Returns an array of point deductions per payer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Points successfully spent',
    type: [SpendResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request (e.g., not enough points, negative points)',
  })
  spendPoints(@Body() spendPointsDto: SpendPointsDto): SpendResponseDto[] {
    return this.pointsService.spendPoints(spendPointsDto.points);
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Get current balances',
    description: 'Get current balance for all payers',
  })
  @ApiResponse({
    status: 200,
    description: 'Current balances for all payers',
    schema: {
      type: 'object',
      additionalProperties: { type: 'number' },
      example: { SHOPIFY: 1000, EBAY: 0, AMAZON: 5300 },
    },
  })
  getBalances(): Record<string, number> {
    return this.pointsService.getBalances();
  }
}
