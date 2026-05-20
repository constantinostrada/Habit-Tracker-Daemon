/**
 * IIdGenerator — Port Interface
 *
 * Layer: Application
 * Responsibility: Abstracts UUID/ULID generation so the use case
 * doesn't depend on a specific library.
 */

export interface IIdGenerator {
  generate(): string;
}
