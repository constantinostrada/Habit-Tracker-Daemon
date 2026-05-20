/**
 * StreakCalculatorService — Domain Service
 *
 * Layer: Domain
 * Responsibility: Encapsulates streak-calculation logic that doesn't belong
 * to a single entity. Operates on pure domain objects only.
 *
 * Imports: domain-only. Zero third-party dependencies.
 */

import { HabitFrequency } from '../value-objects/HabitFrequency';

export interface CompletionRecord {
  completedAt: Date;
  count: number;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0–1 fraction for the observed window
}

export class StreakCalculatorService {
  /**
   * Calculate streak metrics from a sorted list of completion records.
   * @param records  Completion logs ordered newest-first.
   * @param frequency  The habit's frequency definition.
   * @param windowDays  How many days to use for completion-rate calculation.
   */
  calculate(
    records: CompletionRecord[],
    frequency: HabitFrequency,
    windowDays = 30,
  ): StreakResult {
    if (records.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalCompletions: 0, completionRate: 0 };
    }

    const totalCompletions = records.length;

    // Group completions by calendar date string (YYYY-MM-DD UTC)
    const dateSet = new Set(records.map((r) => this.toDateKey(r.completedAt)));
    const sortedDates = Array.from(dateSet).sort().reverse(); // newest first

    const { currentStreak, longestStreak } = this.computeStreaks(sortedDates, frequency);
    const completionRate = this.computeCompletionRate(dateSet, frequency, windowDays);

    return { currentStreak, longestStreak, totalCompletions, completionRate };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private computeStreaks(
    sortedDatesNewestFirst: string[],
    frequency: HabitFrequency,
  ): { currentStreak: number; longestStreak: number } {
    if (sortedDatesNewestFirst.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const gapDays = frequency.type === 'daily' ? 1 : 7;
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDatesNewestFirst.length; i++) {
      const prev = this.fromDateKey(sortedDatesNewestFirst[i - 1]);
      const curr = this.fromDateKey(sortedDatesNewestFirst[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);

      if (diffDays <= gapDays) {
        tempStreak += 1;
        if (i === 1) currentStreak = tempStreak; // still contiguous from today
      } else {
        if (i === 1) currentStreak = 1; // gap before first streak
        tempStreak = 1;
      }

      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  private computeCompletionRate(
    dateSet: Set<string>,
    frequency: HabitFrequency,
    windowDays: number,
  ): number {
    const today = new Date();
    const expectedDays = frequency.type === 'daily'
      ? windowDays
      : Math.floor((windowDays / 7) * frequency.timesPerWeek);

    if (expectedDays === 0) return 0;

    let actual = 0;
    for (let d = 0; d < windowDays; d++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - d);
      if (dateSet.has(this.toDateKey(date))) actual += 1;
    }

    return Math.min(1, actual / expectedDays);
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  private fromDateKey(key: string): Date {
    return new Date(`${key}T00:00:00.000Z`);
  }
}
