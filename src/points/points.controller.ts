import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { AddTransactionDto } from './dto/add-transaction.dto';
import { SpendPointsDto } from './dto/spend-points.dto';
import { SpendResponseDto } from './dto/spend-response.dto';
import type { Transaction } from './interfaces/transaction.interface';
import { ApiAddTransaction } from './decorators/add-transaction.decorator';
import { ApiSpendPoints } from './decorators/spend-points.decorator';
import { ApiGetBalances } from './decorators/get-balances.decorator';

@ApiTags('points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  @ApiAddTransaction()
  addTransaction(@Body() addTransactionDto: AddTransactionDto): Transaction {
    return this.pointsService.addTransaction(addTransactionDto);
  }

  @Post('spend')
  @HttpCode(200)
  @ApiSpendPoints()
  spendPoints(@Body() spendPointsDto: SpendPointsDto): SpendResponseDto[] {
    return this.pointsService.spendPoints(spendPointsDto.points);
  }

  @Get('balance')
  @ApiGetBalances()
  getBalances(): Record<string, number> {
    return this.pointsService.getBalances();
  }
}
