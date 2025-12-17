import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PointsService } from './points.service';

describe('PointsService', () => {
  let service: PointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointsService],
    }).compile();

    service = module.get<PointsService>(PointsService);
  });

  afterEach(() => {
    // Clear transactions after each test
    service['transactions'] = [];
  });

  describe('addTransaction', () => {
    it('should add a transaction successfully', () => {
      const transaction = {
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-02T14:00:00Z',
      };

      const result = service.addTransaction(transaction);

      expect(result).toHaveProperty('payer', 'SHOPIFY');
      expect(result).toHaveProperty('points', 1000);
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should add multiple transactions', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-02T14:00:00Z',
      });

      service.addTransaction({
        payer: 'EBAY',
        points: 500,
        timestamp: '2024-07-01T14:00:00Z',
      });

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(1000);
      expect(balances['EBAY']).toBe(500);
    });

    it('should handle negative point transactions', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-02T14:00:00Z',
      });

      service.addTransaction({
        payer: 'SHOPIFY',
        points: -200,
        timestamp: '2024-07-03T14:00:00Z',
      });

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(800);
    });
  });

  describe('spendPoints', () => {
    beforeEach(() => {
      // Setup: Add the example transactions
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 300,
        timestamp: '2024-06-30T10:00:00Z',
      });

      service.addTransaction({
        payer: 'EBAY',
        points: 200,
        timestamp: '2024-06-30T11:00:00Z',
      });

      service.addTransaction({
        payer: 'SHOPIFY',
        points: -200,
        timestamp: '2024-06-30T15:00:00Z',
      });

      service.addTransaction({
        payer: 'AMAZON',
        points: 10000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-02T14:00:00Z',
      });
    });

    it('should spend points according to the example scenario', () => {
      const result = service.spendPoints(5000);

      expect(result).toHaveLength(3);

      // Check SHOPIFY spent 100 points
      const shopify = result.find((r) => r.payer === 'SHOPIFY');
      expect(shopify).toBeDefined();
      expect(shopify?.points).toBe(-100);

      // Check EBAY spent 200 points
      const ebay = result.find((r) => r.payer === 'EBAY');
      expect(ebay).toBeDefined();
      expect(ebay?.points).toBe(-200);

      // Check AMAZON spent 4700 points
      const amazon = result.find((r) => r.payer === 'AMAZON');
      expect(amazon).toBeDefined();
      expect(amazon?.points).toBe(-4700);
    });

    it('should update balances correctly after spending', () => {
      service.spendPoints(5000);
      const balances = service.getBalances();

      expect(balances['SHOPIFY']).toBe(1000);
      expect(balances['EBAY']).toBe(0);
      expect(balances['AMAZON']).toBe(5300);
    });

    it('should spend oldest points first', () => {
      // Clear and add specific transactions to test ordering
      service['transactions'] = [];

      service.addTransaction({
        payer: 'PAYER_A',
        points: 100,
        timestamp: '2024-07-03T14:00:00Z', // Newest
      });

      service.addTransaction({
        payer: 'PAYER_B',
        points: 100,
        timestamp: '2024-07-01T14:00:00Z', // Oldest
      });

      service.addTransaction({
        payer: 'PAYER_C',
        points: 100,
        timestamp: '2024-07-02T14:00:00Z', // Middle
      });

      const result = service.spendPoints(150);

      // Should spend from PAYER_B (oldest) first, then PAYER_C
      const payerB = result.find((r) => r.payer === 'PAYER_B');
      const payerC = result.find((r) => r.payer === 'PAYER_C');

      expect(payerB).toBeDefined();
      expect(payerB?.points).toBe(-100);
      expect(payerC).toBeDefined();
      expect(payerC?.points).toBe(-50);
    });

    it('should not allow payer balance to go negative', () => {
      service['transactions'] = [];

      service.addTransaction({
        payer: 'SHOPIFY',
        points: 100,
        timestamp: '2024-07-01T14:00:00Z',
      });

      service.addTransaction({
        payer: 'AMAZON',
        points: 500,
        timestamp: '2024-07-02T14:00:00Z',
      });

      // Try to spend more than available
      service.spendPoints(200);

      const balances = service.getBalances();

      // Neither payer should have negative balance
      expect(balances['SHOPIFY']).toBeGreaterThanOrEqual(0);
      expect(balances['AMAZON']).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when trying to spend negative points', () => {
      expect(() => {
        service.spendPoints(-100);
      }).toThrow(BadRequestException);
    });

    it('should throw error when not enough points available', () => {
      service['transactions'] = [];

      service.addTransaction({
        payer: 'SHOPIFY',
        points: 100,
        timestamp: '2024-07-01T14:00:00Z',
      });

      expect(() => {
        service.spendPoints(500);
      }).toThrow(BadRequestException);
    });

    it('should handle spending zero points', () => {
      const result = service.spendPoints(0);
      expect(result).toHaveLength(0);
    });

    it('should handle spending all available points', () => {
      service['transactions'] = [];

      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      const result = service.spendPoints(1000);

      expect(result).toHaveLength(1);
      expect(result[0].payer).toBe('SHOPIFY');
      expect(result[0].points).toBe(-1000);

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(0);
    });
  });

  describe('getBalances', () => {
    it('should return empty object when no transactions', () => {
      const balances = service.getBalances();
      expect(balances).toEqual({});
    });

    it('should return correct balances for single payer', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(1000);
    });

    it('should return correct balances for multiple payers', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      service.addTransaction({
        payer: 'EBAY',
        points: 500,
        timestamp: '2024-07-02T14:00:00Z',
      });

      service.addTransaction({
        payer: 'AMAZON',
        points: 750,
        timestamp: '2024-07-03T14:00:00Z',
      });

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(1000);
      expect(balances['EBAY']).toBe(500);
      expect(balances['AMAZON']).toBe(750);
    });

    it('should aggregate multiple transactions for same payer', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      service.addTransaction({
        payer: 'SHOPIFY',
        points: 500,
        timestamp: '2024-07-02T14:00:00Z',
      });

      service.addTransaction({
        payer: 'SHOPIFY',
        points: -200,
        timestamp: '2024-07-03T14:00:00Z',
      });

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(1300);
    });

    it('should handle zero balances correctly', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      service.addTransaction({
        payer: 'SHOPIFY',
        points: -1000,
        timestamp: '2024-07-02T14:00:00Z',
      });

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle same timestamp for multiple transactions', () => {
      const timestamp = '2024-07-01T14:00:00Z';

      service.addTransaction({
        payer: 'SHOPIFY',
        points: 100,
        timestamp: timestamp,
      });

      service.addTransaction({
        payer: 'EBAY',
        points: 200,
        timestamp: timestamp,
      });

      const result = service.spendPoints(150);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle very large point values', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      const result = service.spendPoints(500000);
      expect(result[0].points).toBe(-500000);

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(500000);
    });

    it('should handle multiple consecutive spends', () => {
      service.addTransaction({
        payer: 'SHOPIFY',
        points: 1000,
        timestamp: '2024-07-01T14:00:00Z',
      });

      service.spendPoints(200);
      service.spendPoints(300);
      service.spendPoints(100);

      const balances = service.getBalances();
      expect(balances['SHOPIFY']).toBe(400);
    });
  });
});
