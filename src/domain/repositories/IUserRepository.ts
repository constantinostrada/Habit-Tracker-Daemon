/**
 * IUserRepository — Repository Interface
 *
 * Layer: Domain
 * Responsibility: Describes persistence operations for User aggregate.
 */

import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  save(user: User): Promise<void>;

  update(user: User): Promise<void>;

  findById(id: UserId): Promise<User | null>;

  findByEmail(email: Email): Promise<User | null>;

  exists(id: UserId): Promise<boolean>;

  existsByEmail(email: Email): Promise<boolean>;

  delete(id: UserId): Promise<void>;
}
