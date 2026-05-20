/**
 * HabitLog Entity
 *
 * Layer: Domain
 * Responsibility: Represents a single completion record for a habit on a given date.
 * Each log entry is immutable once created.
 */

import { HabitLogId } from '../value-objects/HabitLogId';
import { HabitId } from '../value-objects/HabitId';
import { UserId } from '../value-objects/UserId';
import { DomainValidationError } from '../exceptions/DomainValidationError';

export interface HabitLogProps {
  id: HabitLogId;
  habitId: HabitId;
  userId: UserId;
  completedAt: Date;
  note: string;
  count: number;
}

export interface CreateHabitLogProps {
  id: HabitLogId;
  habitId: HabitId;
  userId: UserId;
  completedAt: Date;
  note: string;
  count: number;
}

export class HabitLog {
  private readonly _id: HabitLogId;
  private readonly _habitId: HabitId;
  private readonly _userId: UserId;
  private readonly _completedAt: Date;
  private readonly _note: string;
  private readonly _count: number;

  private constructor(props: HabitLogProps) {
    this._id = props.id;
    this._habitId = props.habitId;
    this._userId = props.userId;
    this._completedAt = props.completedAt;
    this._note = props.note;
    this._count = props.count;
  }

  static create(props: CreateHabitLogProps): HabitLog {
    HabitLog.validateCount(props.count);
    HabitLog.validateNote(props.note);
    return new HabitLog(props);
  }

  static reconstitute(props: HabitLogProps): HabitLog {
    return new HabitLog(props);
  }

  get id(): HabitLogId {
    return this._id;
  }

  get habitId(): HabitId {
    return this._habitId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get completedAt(): Date {
    return this._completedAt;
  }

  get note(): string {
    return this._note;
  }

  get count(): number {
    return this._count;
  }

  private static validateCount(count: number): void {
    if (!Number.isInteger(count) || count < 1) {
      throw new DomainValidationError('Completion count must be a positive integer.');
    }
  }

  private static validateNote(note: string): void {
    if (note.length > 500) {
      throw new DomainValidationError('Note must not exceed 500 characters.');
    }
  }
}
