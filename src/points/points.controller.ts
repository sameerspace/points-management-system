import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import { PointsService } from './points.service';
import { AddTransactionDto } from './dto/add-transaction.dto';
import { SpendPointsDto } from './dto/spend-points.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  addTransaction(@Body() addTransactionDto: AddTransactionDto) {
    return this.pointsService.addTransaction(addTransactionDto);
  }

  @Post('spend')
  @HttpCode(200)
  spendPoints(@Body() spendPointsDto: SpendPointsDto) {
    return this.pointsService.spendPoints(spendPointsDto.points);
  }

  @Get('balance')
  getBalances() {
    return this.pointsService.getBalances();
  }
}
