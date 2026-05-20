/**
 * HabitLog DTOs
 *
 * Layer: Application
 * Responsibility: Input/output contracts for habit-log use cases.
 */

// ─── Input DTOs ───────────────────────────────────────────────────────────────

export interface LogHabitCompletionDto {
  habitId: string;
  userId: string;
  completedAt?: string; // ISO 8601 — defaults to now if omitted
  note?: string;
  count?: number; // defaults to 1
}

export interface GetHabitLogsDto {
  habitId: string;
  userId: string;
  from?: string; // ISO 8601
  to?: string; // ISO 8601
  page?: number;
  pageSize?: number;
}

// ─── Output DTOs ─────────────────────────────────────────────────────────────

export interface HabitLogResponseDto {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  note: string;
  count: number;
}

export interface HabitStatsDto {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}
