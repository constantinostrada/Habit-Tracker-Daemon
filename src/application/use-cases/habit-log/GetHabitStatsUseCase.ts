/**
 * GetHabitStatsUseCase
 *
 * Layer: Application
 * Responsibility: Compute and return streak/completion statistics for a habit.
 * Delegates calculation to the StreakCalculatorService domain service.
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { IHabitLogRepository } from '../../../domain/repositories/IHabitLogRepository';
import { StreakCalculatorService } from '../../../domain/services/StreakCalculatorService';
import { HabitId } from '../../../domain/value-objects/HabitId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { HabitStatsDto } from '../../dtos/HabitLogDto';

export class GetHabitStatsUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly habitLogRepository: IHabitLogRepository,
    private readonly streakCalculator: StreakCalculatorService,
  ) {}

  async execute(habitId: string, userId: string): Promise<HabitStatsDto> {
    const hId = HabitId.from(habitId);
    const uId = UserId.from(userId);

    const habit = await this.habitRepository.findById(hId);
    if (!habit || !habit.isOwnedBy(uId)) {
      throw new DomainNotFoundError('Habit', habitId);
    }

    const logs = await this.habitLogRepository.findByHabitId(hId);

    const completionRecords = logs.map((l) => ({
      completedAt: l.completedAt,
      count: l.count,
    }));

    const stats = this.streakCalculator.calculate(completionRecords, habit.frequency);

    return {
      habitId,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCompletions: stats.totalCompletions,
      completionRate: stats.completionRate,
    };
  }
}
