/**
 * PostgresUserRepository
 *
 * Layer: Infrastructure
 * Responsibility: Implements IUserRepository using PostgreSQL.
 */

import { QueryResultRow } from 'pg';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { PostgresClient } from '../database/PostgresClient';

interface UserRow extends QueryResultRow {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly db: PostgresClient) {}

  async save(user: User): Promise<void> {
    await this.db.query(
      `INSERT INTO users
         (id, email, display_name, password_hash, is_verified, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        user.id.value,
        user.email.value,
        user.displayName,
        user.passwordHash,
        user.isVerified,
        user.createdAt,
        user.updatedAt,
      ],
    );
  }

  async update(user: User): Promise<void> {
    await this.db.query(
      `UPDATE users
         SET display_name  = $1,
             password_hash = $2,
             is_verified   = $3,
             updated_at    = $4
       WHERE id = $5`,
      [user.displayName, user.passwordHash, user.isVerified, user.updatedAt, user.id.value],
    );
  }

  async findById(id: UserId): Promise<User | null> {
    const { rows } = await this.db.query<UserRow>(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id.value],
    );
    return rows[0] ? this.rowToEntity(rows[0]) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const { rows } = await this.db.query<UserRow>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.value],
    );
    return rows[0] ? this.rowToEntity(rows[0]) : null;
  }

  async exists(id: UserId): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1) AS exists',
      [id.value],
    );
    return rows[0]?.exists ?? false;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists',
      [email.value],
    );
    return rows[0]?.exists ?? false;
  }

  async delete(id: UserId): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id.value]);
  }

  private rowToEntity(row: UserRow): User {
    return User.reconstitute({
      id: UserId.from(row.id),
      email: Email.from(row.email),
      displayName: row.display_name,
      passwordHash: row.password_hash,
      isVerified: row.is_verified,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
