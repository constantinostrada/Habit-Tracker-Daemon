/**
 * HabitId Value Object
 *
 * Layer: Domain
 * Responsibility: Typed identity for the Habit aggregate root.
 * Immutable; equality by value.
 */

import { DomainValidationError } from '../exceptions/DomainValidationError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class HabitId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static from(value: string): HabitId {
    if (!UUID_REGEX.test(value)) {
      throw new DomainValidationError(`Invalid HabitId: '${value}' is not a valid UUID.`);
    }
    return new HabitId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
