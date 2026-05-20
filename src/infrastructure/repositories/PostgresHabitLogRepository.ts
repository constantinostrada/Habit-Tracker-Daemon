/**
 * PostgresHabitLogRepository
 *
 * Layer: Infrastructure
 * Responsibility: Implements IHabitLogRepository using PostgreSQL.
 */

import { QueryResultRow } from 'pg';
import { IHabitLogRepository, FindLogsOptions } from '../../domain/repositories/IHabitLogRepository';
import { HabitLog } from '../../domain/entities/HabitLog';
import { HabitId } from '../../domain/value-objects/HabitId';
import { HabitLogId } from '../../domain/value-objects/HabitLogId';
import { UserId } from '../../domain/value-objects/UserId';
import { PostgresClient } from '../database/PostgresClient';

interface HabitLogRow extends QueryResultRow {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: Date;
  note: string;
  count: number;
}

export class PostgresHabitLogRepository implements IHabitLogRepository {
  constructor(private readonly db: PostgresClient) {}

  async save(log: HabitLog): Promise<void> {
    await this.db.query(
      `INSERT INTO habit_logs (id, habit_id, user_id, completed_at, note, count)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        log.id.value,
        log.habitId.value,
        log.userId.value,
        log.completedAt,
        log.note,
        log.count,
      ],
    );
  }

  async findById(id: HabitLogId): Promise<HabitLog | null> {
    const { rows } = await this.db.query<HabitLogRow>(
      'SELECT * FROM habit_logs WHERE id = $1 LIMIT 1',
      [id.value],
    );
    return rows[0] ? this.rowToEntity(rows[0]) : null;
  }

  async findByHabitId(habitId: HabitId, options: FindLogsOptions = {}): Promise<HabitLog[]> {
    const { sql, params } = this.buildFindQuery('habit_id = $1', habitId.value, options);
    const { rows } = await this.db.query<HabitLogRow>(sql, params);
    return rows.map((r) => this.rowToEntity(r));
  }

  async findByUserId(userId: UserId, options: FindLogsOptions = {}): Promise<HabitLog[]> {
    const { sql, params } = this.buildFindQuery('user_id = $1', userId.value, options);
    const { rows } = await this.db.query<HabitLogRow>(sql, params);
    return rows.map((r) => this.rowToEntity(r));
  }

  async countByHabitId(
    habitId: HabitId,
    options: Pick<FindLogsOptions, 'from' | 'to'> = {},
  ): Promise<number> {
    const conditions: string[] = ['habit_id = $1'];
    const params: unknown[] = [habitId.value];

    if (options.from) {
      params.push(options.from);
      conditions.push(`completed_at >= $${params.length}`);
    }
    if (options.to) {
      params.push(options.to);
      conditions.push(`completed_at <= $${params.length}`);
    }

    const { rows } = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM habit_logs WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  }

  async existsForDate(habitId: HabitId, date: Date): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM habit_logs
          WHERE habit_id = $1
            AND DATE(completed_at) = DATE($2)
       ) AS exists`,
      [habitId.value, date],
    );
    return rows[0]?.exists ?? false;
  }

  async delete(id: HabitLogId): Promise<void> {
    await this.db.query('DELETE FROM habit_logs WHERE id = $1', [id.value]);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private buildFindQuery(
    baseCondition: string,
    baseValue: string,
    options: FindLogsOptions,
  ): { sql: string; params: unknown[] } {
    const conditions: string[] = [baseCondition];
    const params: unknown[] = [baseValue];

    if (options.from) {
      params.push(options.from);
      conditions.push(`completed_at >= $${params.length}`);
    }
    if (options.to) {
      params.push(options.to);
      conditions.push(`completed_at <= $${params.length}`);
    }

    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    params.push(limit, offset);

    const sql = `
      SELECT * FROM habit_logs
       WHERE ${conditions.join(' AND ')}
       ORDER BY completed_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    return { sql, params };
  }

  private rowToEntity(row: HabitLogRow): HabitLog {
    return HabitLog.reconstitute({
      id: HabitLogId.from(row.id),
      habitId: HabitId.from(row.habit_id),
      userId: UserId.from(row.user_id),
      completedAt: new Date(row.completed_at),
      note: row.note,
      count: row.count,
    });
  }
}
