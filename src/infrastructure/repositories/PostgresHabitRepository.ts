/**
 * PostgresHabitRepository
 *
 * Layer: Infrastructure
 * Responsibility: Implements IHabitRepository using PostgreSQL.
 * Maps DB rows ↔ domain Habit entities. Zero business logic here.
 */

import { QueryResultRow } from 'pg';
import { IHabitRepository, FindHabitsOptions } from '../../domain/repositories/IHabitRepository';
import { Habit } from '../../domain/entities/Habit';
import { HabitId } from '../../domain/value-objects/HabitId';
import { UserId } from '../../domain/value-objects/UserId';
import { HabitFrequency } from '../../domain/value-objects/HabitFrequency';
import { PostgresClient } from '../database/PostgresClient';

interface HabitRow extends QueryResultRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  frequency_type: string;
  times_per_week: number;
  target_count: number;
  status: string;
  streak_count: number;
  longest_streak: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresHabitRepository implements IHabitRepository {
  constructor(private readonly db: PostgresClient) {}

  async save(habit: Habit): Promise<void> {
    await this.db.query(
      `INSERT INTO habits
        (id, user_id, name, description, frequency_type, times_per_week,
         target_count, status, streak_count, longest_streak, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        habit.id.value,
        habit.userId.value,
        habit.name,
        habit.description,
        habit.frequency.type,
        habit.frequency.timesPerWeek,
        habit.targetCount,
        habit.status,
        habit.streakCount,
        habit.longestStreak,
        habit.createdAt,
        habit.updatedAt,
      ],
    );
  }

  async update(habit: Habit): Promise<void> {
    await this.db.query(
      `UPDATE habits
         SET name           = $1,
             description    = $2,
             frequency_type = $3,
             times_per_week = $4,
             target_count   = $5,
             status         = $6,
             streak_count   = $7,
             longest_streak = $8,
             updated_at     = $9
       WHERE id = $10`,
      [
        habit.name,
        habit.description,
        habit.frequency.type,
        habit.frequency.timesPerWeek,
        habit.targetCount,
        habit.status,
        habit.streakCount,
        habit.longestStreak,
        habit.updatedAt,
        habit.id.value,
      ],
    );
  }

  async findById(id: HabitId): Promise<Habit | null> {
    const { rows } = await this.db.query<HabitRow>(
      'SELECT * FROM habits WHERE id = $1 LIMIT 1',
      [id.value],
    );
    return rows[0] ? this.rowToEntity(rows[0]) : null;
  }

  async findAllByUserId(userId: UserId, options: FindHabitsOptions = {}): Promise<Habit[]> {
    const conditions: string[] = ['user_id = $1'];
    const params: unknown[] = [userId.value];

    if (options.status) {
      params.push(options.status);
      conditions.push(`status = $${params.length}`);
    }

    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    params.push(limit, offset);

    const sql = `
      SELECT * FROM habits
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await this.db.query<HabitRow>(sql, params);
    return rows.map((r) => this.rowToEntity(r));
  }

  async countByUserId(
    userId: UserId,
    options: Pick<FindHabitsOptions, 'status'> = {},
  ): Promise<number> {
    const conditions: string[] = ['user_id = $1'];
    const params: unknown[] = [userId.value];

    if (options.status) {
      params.push(options.status);
      conditions.push(`status = $${params.length}`);
    }

    const { rows } = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM habits WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  }

  async delete(id: HabitId): Promise<void> {
    await this.db.query('DELETE FROM habits WHERE id = $1', [id.value]);
  }

  async exists(id: HabitId): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM habits WHERE id = $1) AS exists',
      [id.value],
    );
    return rows[0]?.exists ?? false;
  }

  // ─── Private mapping ─────────────────────────────────────────────────────────

  private rowToEntity(row: HabitRow): Habit {
    return Habit.reconstitute({
      id: HabitId.from(row.id),
      userId: UserId.from(row.user_id),
      name: row.name,
      description: row.description,
      frequency: HabitFrequency.create({
        type: row.frequency_type as 'daily' | 'weekly' | 'custom',
        timesPerWeek: row.times_per_week,
      }),
      targetCount: row.target_count,
      status: row.status as 'active' | 'paused' | 'archived',
      streakCount: row.streak_count,
      longestStreak: row.longest_streak,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
