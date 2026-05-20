/**
 * DomainNotFoundError
 *
 * Layer: Domain
 * Responsibility: Raised when a required aggregate or entity cannot be found.
 */

export class DomainNotFoundError extends Error {
  readonly name = 'DomainNotFoundError';

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' was not found.`);
    Object.setPrototypeOf(this, DomainNotFoundError.prototype);
  }
}
