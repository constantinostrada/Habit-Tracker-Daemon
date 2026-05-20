/**
 * HabitMapper
 *
 * Layer: Application
 * Responsibility: Converts domain Habit entities into HabitResponseDto objects.
 * Domain entities are NEVER returned directly from use cases.
 */

import { Habit } from '../../domain/entities/Habit';
import { HabitResponseDto } from '../dtos/HabitDto';

export class HabitMapper {
  static toDto(habit: Habit): HabitResponseDto {
    return {
      id: habit.id.value,
      userId: habit.userId.value,
      name: habit.name,
      description: habit.description,
      frequencyType: habit.frequency.type,
      timesPerWeek: habit.frequency.timesPerWeek,
      targetCount: habit.targetCount,
      status: habit.status,
      streakCount: habit.streakCount,
      longestStreak: habit.longestStreak,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };
  }

  static toDtoList(habits: Habit[]): HabitResponseDto[] {
    return habits.map(HabitMapper.toDto);
  }
}
