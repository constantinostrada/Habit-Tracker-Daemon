/**
 * UserId Value Object
 *
 * Layer: Domain
 * Responsibility: Typed identity for the User aggregate root.
 */

import { DomainValidationError } from '../exceptions/DomainValidationError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UserId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static from(value: string): UserId {
    if (!UUID_REGEX.test(value)) {
      throw new DomainValidationError(`Invalid UserId: '${value}' is not a valid UUID.`);
    }
    return new UserId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
