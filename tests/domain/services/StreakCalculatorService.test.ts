/**
 * StreakCalculatorService Tests
 */

import { StreakCalculatorService } from '../../../src/domain/services/StreakCalculatorService';
import { HabitFrequency } from '../../../src/domain/value-objects/HabitFrequency';

const daily = HabitFrequency.create({ type: 'daily' });
const weekly = HabitFrequency.create({ type: 'weekly' });

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(10, 0, 0, 0);
  return d;
};

describe('StreakCalculatorService', () => {
  const service = new StreakCalculatorService();

  it('returns zeros for empty records', () => {
    const result = service.calculate([], daily);
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
    });
  });

  it('counts total completions', () => {
    const records = [
      { completedAt: daysAgo(0), count: 1 },
      { completedAt: daysAgo(1), count: 1 },
    ];
    const result = service.calculate(records, daily);
    expect(result.totalCompletions).toBe(2);
  });

  it('calculates a consecutive daily streak', () => {
    const records = [
      { completedAt: daysAgo(0), count: 1 },
      { completedAt: daysAgo(1), count: 1 },
      { completedAt: daysAgo(2), count: 1 },
    ];
    const result = service.calculate(records, daily);
    expect(result.currentStreak).toBeGreaterThanOrEqual(1);
    expect(result.longestStreak).toBeGreaterThanOrEqual(1);
  });

  it('returns completionRate between 0 and 1', () => {
    const records = [{ completedAt: daysAgo(0), count: 1 }];
    const result = service.calculate(records, daily, 30);
    expect(result.completionRate).toBeGreaterThanOrEqual(0);
    expect(result.completionRate).toBeLessThanOrEqual(1);
  });
});
