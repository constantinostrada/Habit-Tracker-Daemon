/**
 * Habit Entity Tests
 *
 * Verifies that the Habit entity correctly enforces its invariants
 * and applies domain behaviour.
 */

import { Habit } from '../../../src/domain/entities/Habit';
import { HabitId } from '../../../src/domain/value-objects/HabitId';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { HabitFrequency } from '../../../src/domain/value-objects/HabitFrequency';
import { DomainValidationError } from '../../../src/domain/exceptions/DomainValidationError';

const makeHabit = (overrides: Partial<{ name: string; targetCount: number }> = {}): Habit =>
  Habit.create({
    id: HabitId.from('550e8400-e29b-41d4-a716-446655440000'),
    userId: UserId.from('550e8400-e29b-41d4-a716-446655440001'),
    name: overrides.name ?? 'Morning Run',
    description: 'Run 5 km every morning',
    frequency: HabitFrequency.create({ type: 'daily' }),
    targetCount: overrides.targetCount ?? 1,
  });

describe('Habit entity', () => {
  describe('create()', () => {
    it('creates a habit with default active status', () => {
      const habit = makeHabit();
      expect(habit.status).toBe('active');
      expect(habit.streakCount).toBe(0);
      expect(habit.longestStreak).toBe(0);
    });

    it('throws when name is empty', () => {
      expect(() => makeHabit({ name: '' })).toThrow(DomainValidationError);
    });

    it('throws when name is too short', () => {
      expect(() => makeHabit({ name: 'x' })).toThrow(DomainValidationError);
    });

    it('throws when name exceeds 120 characters', () => {
      expect(() => makeHabit({ name: 'a'.repeat(121) })).toThrow(DomainValidationError);
    });

    it('throws when targetCount is zero', () => {
      expect(() => makeHabit({ targetCount: 0 })).toThrow(DomainValidationError);
    });

    it('throws when targetCount is negative', () => {
      expect(() => makeHabit({ targetCount: -1 })).toThrow(DomainValidationError);
    });

    it('throws when targetCount exceeds 100', () => {
      expect(() => makeHabit({ targetCount: 101 })).toThrow(DomainValidationError);
    });
  });

  describe('recordCompletion()', () => {
    it('increments streakCount', () => {
      const habit = makeHabit();
      habit.recordCompletion();
      expect(habit.streakCount).toBe(1);
    });

    it('updates longestStreak when current exceeds it', () => {
      const habit = makeHabit();
      habit.recordCompletion();
      habit.recordCompletion();
      expect(habit.longestStreak).toBe(2);
    });

    it('throws when habit is paused', () => {
      const habit = makeHabit();
      habit.pause();
      expect(() => habit.recordCompletion()).toThrow(DomainValidationError);
    });

    it('throws when habit is archived', () => {
      const habit = makeHabit();
      habit.archive();
      expect(() => habit.recordCompletion()).toThrow(DomainValidationError);
    });
  });

  describe('breakStreak()', () => {
    it('resets streakCount to 0 but preserves longestStreak', () => {
      const habit = makeHabit();
      habit.recordCompletion();
      habit.recordCompletion();
      habit.breakStreak();
      expect(habit.streakCount).toBe(0);
      expect(habit.longestStreak).toBe(2);
    });
  });

  describe('pause() / resume() / archive()', () => {
    it('transitions active → paused → active', () => {
      const habit = makeHabit();
      habit.pause();
      expect(habit.status).toBe('paused');
      habit.resume();
      expect(habit.status).toBe('active');
    });

    it('transitions active → archived', () => {
      const habit = makeHabit();
      habit.archive();
      expect(habit.status).toBe('archived');
    });

    it('throws when pausing an archived habit', () => {
      const habit = makeHabit();
      habit.archive();
      expect(() => habit.pause()).toThrow(DomainValidationError);
    });
  });
});
