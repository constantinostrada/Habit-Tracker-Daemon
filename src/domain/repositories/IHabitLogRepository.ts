/**
 * IHabitLogRepository — Repository Interface
 *
 * Layer: Domain
 * Responsibility: Describes persistence operations for HabitLog records.
 */

import { HabitLog } from '../entities/HabitLog';
import { HabitId } from '../value-objects/HabitId';
import { HabitLogId } from '../value-objects/HabitLogId';
import { UserId } from '../value-objects/UserId';

export interface FindLogsOptions {
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface IHabitLogRepository {
  save(log: HabitLog): Promise<void>;

  findById(id: HabitLogId): Promise<HabitLog | null>;

  findByHabitId(habitId: HabitId, options?: FindLogsOptions): Promise<HabitLog[]>;

  findByUserId(userId: UserId, options?: FindLogsOptions): Promise<HabitLog[]>;

  countByHabitId(habitId: HabitId, options?: Pick<FindLogsOptions, 'from' | 'to'>): Promise<number>;

  /** Check if a habit was already logged on a specific calendar date */
  existsForDate(habitId: HabitId, date: Date): Promise<boolean>;

  delete(id: HabitLogId): Promise<void>;
}
