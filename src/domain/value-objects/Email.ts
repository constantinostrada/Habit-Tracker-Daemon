/**
 * Email Value Object
 *
 * Layer: Domain
 * Responsibility: Encapsulates email validation and normalisation rules.
 * Immutable; equality by normalised value.
 */

import { DomainValidationError } from '../exceptions/DomainValidationError';

// RFC 5322-inspired — pragmatic pattern for production use
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static from(raw: string): Email {
    const normalised = raw.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalised)) {
      throw new DomainValidationError(`'${raw}' is not a valid email address.`);
    }
    if (normalised.length > 254) {
      throw new DomainValidationError('Email address exceeds maximum length of 254 characters.');
    }
    return new Email(normalised);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
