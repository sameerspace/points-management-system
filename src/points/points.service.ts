import { Injectable, BadRequestException } from '@nestjs/common';
import { Transaction } from './interfaces/transaction.interface';
import { AddTransactionDto } from './dto/add-transaction.dto';
import { SpendResponseDto } from './dto/spend-response.dto';

@Injectable()
export class PointsService {
  private transactions: Transaction[] = [];

  addTransaction(addTransactionDto: AddTransactionDto): Transaction {
    const transaction: Transaction = {
      payer: addTransactionDto.payer,
      points: addTransactionDto.points,
      timestamp: new Date(addTransactionDto.timestamp),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  spendPoints(pointsToSpend: number): SpendResponseDto[] {
    if (pointsToSpend < 0) {
      throw new BadRequestException('Points to spend must be positive');
    }

    const totalPoints = this.getTotalPoints();
    if (pointsToSpend > totalPoints) {
      throw new BadRequestException('Not enough points to spend');
    }

    const sortedTransactions = [...this.transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    let remainingToSpend = pointsToSpend;
    const payerSpending: Map<string, number> = new Map();

    for (const transaction of sortedTransactions) {
      if (remainingToSpend === 0) break;

      const payer = transaction.payer;
      const availablePoints = transaction.points;

      const pointsToDeduct = Math.min(availablePoints, remainingToSpend);

      if (pointsToDeduct > 0) {
        const currentPayerBalance = this.getPayerBalance(payer);
        const newBalance = currentPayerBalance - pointsToDeduct;

        if (newBalance >= 0) {
          payerSpending.set(
            payer,
            (payerSpending.get(payer) || 0) - pointsToDeduct,
          );

          this.transactions.push({
            payer: payer,
            points: -pointsToDeduct,
            timestamp: new Date(),
          });

          remainingToSpend -= pointsToDeduct;
        }
      }
    }

    const response: SpendResponseDto[] = [];
    payerSpending.forEach((points, payer) => {
      response.push({ payer, points });
    });

    return response;
  }

  getBalances(): Record<string, number> {
    const balances: Record<string, number> = {};

    // Sum up all transactions per payer
    for (const transaction of this.transactions) {
      const payer = transaction.payer;
      balances[payer] = (balances[payer] || 0) + transaction.points;
    }

    return balances;
  }

  private getTotalPoints(): number {
    return this.transactions.reduce(
      (sum, transaction) => sum + transaction.points,
      0,
    );
  }

  private getPayerBalance(payer: string): number {
    return this.transactions
      .filter((t) => t.payer === payer)
      .reduce((sum, t) => sum + t.points, 0);
  }
}
