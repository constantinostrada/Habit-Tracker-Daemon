/**
 * User Entity
 *
 * Layer: Domain
 * Responsibility: Represents a registered user in the habit tracker system.
 * Protects identity and credential invariants.
 */

import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { DomainValidationError } from '../exceptions/DomainValidationError';

export interface UserProps {
  id: UserId;
  email: Email;
  displayName: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  id: UserId;
  email: Email;
  displayName: string;
  passwordHash: string;
}

export class User {
  private readonly _id: UserId;
  private readonly _email: Email;
  private _displayName: string;
  private _passwordHash: string;
  private _isVerified: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._displayName = props.displayName;
    this._passwordHash = props.passwordHash;
    this._isVerified = props.isVerified;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    User.validateDisplayName(props.displayName);
    User.validatePasswordHash(props.passwordHash);

    const now = new Date();
    return new User({
      ...props,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get displayName(): string {
    return this._displayName;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  verify(): void {
    this._isVerified = true;
    this._updatedAt = new Date();
  }

  updateDisplayName(name: string): void {
    User.validateDisplayName(name);
    this._displayName = name;
    this._updatedAt = new Date();
  }

  updatePasswordHash(hash: string): void {
    User.validatePasswordHash(hash);
    this._passwordHash = hash;
    this._updatedAt = new Date();
  }

  private static validateDisplayName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainValidationError('Display name must not be empty.');
    }
    if (name.trim().length < 2) {
      throw new DomainValidationError('Display name must be at least 2 characters.');
    }
    if (name.trim().length > 60) {
      throw new DomainValidationError('Display name must not exceed 60 characters.');
    }
  }

  private static validatePasswordHash(hash: string): void {
    if (!hash || hash.trim().length === 0) {
      throw new DomainValidationError('Password hash must not be empty.');
    }
  }
}
