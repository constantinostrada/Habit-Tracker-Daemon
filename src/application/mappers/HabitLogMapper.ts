/**
 * HabitLogMapper
 *
 * Layer: Application
 * Responsibility: Converts HabitLog domain entities into response DTOs.
 */

import { HabitLog } from '../../domain/entities/HabitLog';
import { HabitLogResponseDto } from '../dtos/HabitLogDto';

export class HabitLogMapper {
  static toDto(log: HabitLog): HabitLogResponseDto {
    return {
      id: log.id.value,
      habitId: log.habitId.value,
      userId: log.userId.value,
      completedAt: log.completedAt.toISOString(),
      note: log.note,
      count: log.count,
    };
  }

  static toDtoList(logs: HabitLog[]): HabitLogResponseDto[] {
    return logs.map(HabitLogMapper.toDto);
  }
}
