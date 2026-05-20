/**
 * DomainConflictError
 *
 * Layer: Domain
 * Responsibility: Raised when an operation would violate a uniqueness or
 * idempotency constraint (e.g. duplicate email, duplicate log for today).
 */

export class DomainConflictError extends Error {
  readonly name = 'DomainConflictError';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DomainConflictError.prototype);
  }
}
