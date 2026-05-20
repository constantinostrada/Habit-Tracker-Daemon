/**
 * Habit Entity
 *
 * Layer: Domain
 * Responsibility: Core business object representing a trackable habit.
 * Protects its own invariants — all validation lives here.
 *
 * Imports: domain-only primitives. Zero third-party dependencies.
 */

import { HabitId } from '../value-objects/HabitId';
import { UserId } from '../value-objects/UserId';
import { HabitFrequency } from '../value-objects/HabitFrequency';
import { DomainValidationError } from '../exceptions/DomainValidationError';

export type HabitStatus = 'active' | 'paused' | 'archived';

export interface HabitProps {
  id: HabitId;
  userId: UserId;
  name: string;
  description: string;
  frequency: HabitFrequency;
  targetCount: number;
  status: HabitStatus;
  streakCount: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitProps {
  id: HabitId;
  userId: UserId;
  name: string;
  description: string;
  frequency: HabitFrequency;
  targetCount: number;
}

export class Habit {
  private readonly _id: HabitId;
  private readonly _userId: UserId;
  private _name: string;
  private _description: string;
  private _frequency: HabitFrequency;
  private _targetCount: number;
  private _status: HabitStatus;
  private _streakCount: number;
  private _longestStreak: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: HabitProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._name = props.name;
    this._description = props.description;
    this._frequency = props.frequency;
    this._targetCount = props.targetCount;
    this._status = props.status;
    this._streakCount = props.streakCount;
    this._longestStreak = props.longestStreak;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /** Factory: create a brand-new habit (validates invariants) */
  static create(props: CreateHabitProps): Habit {
    Habit.validateName(props.name);
    Habit.validateTargetCount(props.targetCount);

    const now = new Date();
    return new Habit({
      ...props,
      status: 'active',
      streakCount: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Factory: reconstitute an existing habit from persistence */
  static reconstitute(props: HabitProps): Habit {
    return new Habit(props);
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get id(): HabitId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get frequency(): HabitFrequency {
    return this._frequency;
  }

  get targetCount(): number {
    return this._targetCount;
  }

  get status(): HabitStatus {
    return this._status;
  }

  get streakCount(): number {
    return this._streakCount;
  }

  get longestStreak(): number {
    return this._longestStreak;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ─── Domain Behaviour ───────────────────────────────────────────────────────

  /** Update mutable fields, re-validating all invariants */
  update(name: string, description: string, targetCount: number): void {
    Habit.validateName(name);
    Habit.validateTargetCount(targetCount);
    this._name = name;
    this._description = description;
    this._targetCount = targetCount;
    this._updatedAt = new Date();
  }

  /** Mark the habit as completed for the current period — advances streak */
  recordCompletion(): void {
    if (this._status !== 'active') {
      throw new DomainValidationError(
        `Cannot record completion for a habit in '${this._status}' status.`,
      );
    }
    this._streakCount += 1;
    if (this._streakCount > this._longestStreak) {
      this._longestStreak = this._streakCount;
    }
    this._updatedAt = new Date();
  }

  /** Break the current streak (missed period) */
  breakStreak(): void {
    this._streakCount = 0;
    this._updatedAt = new Date();
  }

  pause(): void {
    if (this._status === 'archived') {
      throw new DomainValidationError('Cannot pause an archived habit.');
    }
    this._status = 'paused';
    this._updatedAt = new Date();
  }

  resume(): void {
    if (this._status === 'archived') {
      throw new DomainValidationError('Cannot resume an archived habit.');
    }
    this._status = 'active';
    this._updatedAt = new Date();
  }

  archive(): void {
    this._status = 'archived';
    this._updatedAt = new Date();
  }

  isActive(): boolean {
    return this._status === 'active';
  }

  isOwnedBy(userId: UserId): boolean {
    return this._userId.equals(userId);
  }

  // ─── Private Validators ─────────────────────────────────────────────────────

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainValidationError('Habit name must not be empty.');
    }
    if (name.trim().length < 2) {
      throw new DomainValidationError('Habit name must be at least 2 characters.');
    }
    if (name.trim().length > 120) {
      throw new DomainValidationError('Habit name must not exceed 120 characters.');
    }
  }

  private static validateTargetCount(count: number): void {
    if (!Number.isInteger(count) || count < 1) {
      throw new DomainValidationError('Target count must be a positive integer.');
    }
    if (count > 100) {
      throw new DomainValidationError('Target count must not exceed 100.');
    }
  }
}
