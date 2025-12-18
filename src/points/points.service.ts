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

    const transactionAvailable: number[] = sortedTransactions.map((t) =>
      t.points > 0 ? t.points : 0,
    );

    for (let i = 0; i < sortedTransactions.length; i++) {
      const transaction = sortedTransactions[i];
      if (transaction.points < 0) {
        let remainingNegative = -transaction.points;
        for (let j = 0; j < i && remainingNegative > 0; j++) {
          if (sortedTransactions[j].payer === transaction.payer) {
            const reduction = Math.min(
              transactionAvailable[j],
              remainingNegative,
            );
            transactionAvailable[j] -= reduction;
            remainingNegative -= reduction;
          }
        }
      }
    }

    let remainingToSpend = pointsToSpend;
    const payerSpending: Map<string, number> = new Map();

    for (
      let i = 0;
      i < sortedTransactions.length && remainingToSpend > 0;
      i++
    ) {
      const transaction = sortedTransactions[i];
      const available = transactionAvailable[i];

      if (available > 0) {
        const payer = transaction.payer;
        const currentBalance = this.getPayerBalance(payer);
        const pointsToDeduct = Math.min(
          available,
          remainingToSpend,
          currentBalance,
        );

        if (pointsToDeduct > 0) {
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
    return this.transactions.reduce(
      (balances, { payer, points }) => {
        balances[payer] = (balances[payer] || 0) + points;
        return balances;
      },
      {} as Record<string, number>,
    );
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
