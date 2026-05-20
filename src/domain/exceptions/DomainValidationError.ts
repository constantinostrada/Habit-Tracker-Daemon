/**
 * DomainValidationError
 *
 * Layer: Domain
 * Responsibility: Represents a broken domain invariant.
 * Thrown by entities and value objects when their rules are violated.
 */

export class DomainValidationError extends Error {
  readonly name = 'DomainValidationError';

  constructor(message: string) {
    super(message);
    // Restore prototype chain (required for instanceof checks in TypeScript)
    Object.setPrototypeOf(this, DomainValidationError.prototype);
  }
}
