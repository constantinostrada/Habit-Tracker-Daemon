/**
 * IHabitRepository — Repository Interface
 *
 * Layer: Domain
 * Responsibility: Describes WHAT persistence operations exist for Habit.
 * Does NOT describe HOW they are implemented (no SQL, no ORM).
 *
 * Infrastructure will provide a concrete class that fulfils this contract.
 */

import { Habit } from '../entities/Habit';
import { HabitId } from '../value-objects/HabitId';
import { UserId } from '../value-objects/UserId';

export interface FindHabitsOptions {
  status?: 'active' | 'paused' | 'archived';
  limit?: number;
  offset?: number;
}

export interface IHabitRepository {
  /** Persist a newly created habit */
  save(habit: Habit): Promise<void>;

  /** Persist updates to an existing habit */
  update(habit: Habit): Promise<void>;

  /** Find a single habit by its ID */
  findById(id: HabitId): Promise<Habit | null>;

  /** Find all habits belonging to a user, with optional filtering */
  findAllByUserId(userId: UserId, options?: FindHabitsOptions): Promise<Habit[]>;

  /** Count habits for a user (used for pagination metadata) */
  countByUserId(userId: UserId, options?: Pick<FindHabitsOptions, 'status'>): Promise<number>;

  /** Remove a habit permanently */
  delete(id: HabitId): Promise<void>;

  /** Check whether a habit with a given ID exists */
  exists(id: HabitId): Promise<boolean>;
}
