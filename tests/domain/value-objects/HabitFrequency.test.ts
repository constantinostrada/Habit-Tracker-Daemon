/**
 * HabitFrequency Value Object Tests
 */

import { HabitFrequency } from '../../../src/domain/value-objects/HabitFrequency';
import { DomainValidationError } from '../../../src/domain/exceptions/DomainValidationError';

describe('HabitFrequency value object', () => {
  it('creates a daily frequency with timesPerWeek = 7', () => {
    const freq = HabitFrequency.create({ type: 'daily' });
    expect(freq.type).toBe('daily');
    expect(freq.timesPerWeek).toBe(7);
  });

  it('creates a weekly frequency with timesPerWeek = 1', () => {
    const freq = HabitFrequency.create({ type: 'weekly' });
    expect(freq.type).toBe('weekly');
    expect(freq.timesPerWeek).toBe(1);
  });

  it('creates a custom frequency with valid timesPerWeek', () => {
    const freq = HabitFrequency.create({ type: 'custom', timesPerWeek: 3 });
    expect(freq.type).toBe('custom');
    expect(freq.timesPerWeek).toBe(3);
  });

  it('throws for custom frequency with timesPerWeek = 0', () => {
    expect(() => HabitFrequency.create({ type: 'custom', timesPerWeek: 0 })).toThrow(
      DomainValidationError,
    );
  });

  it('throws for custom frequency with timesPerWeek > 7', () => {
    expect(() => HabitFrequency.create({ type: 'custom', timesPerWeek: 8 })).toThrow(
      DomainValidationError,
    );
  });

  it('implements value equality', () => {
    const a = HabitFrequency.create({ type: 'custom', timesPerWeek: 4 });
    const b = HabitFrequency.create({ type: 'custom', timesPerWeek: 4 });
    expect(a.equals(b)).toBe(true);
  });
});
