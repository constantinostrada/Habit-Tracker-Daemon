/**
 * Habit DTOs
 *
 * Layer: Application
 * Responsibility: Input/output contracts for habit-related use cases.
 * These are plain data objects — no domain logic, no ORM annotations.
 */

import { FrequencyType } from '../../domain/value-objects/HabitFrequency';

// ─── Input DTOs (consumed by use cases) ─────────────────────────────────────

export interface CreateHabitDto {
  userId: string;
  name: string;
  description: string;
  frequencyType: FrequencyType;
  timesPerWeek?: number;
  targetCount: number;
}

export interface UpdateHabitDto {
  habitId: string;
  userId: string; // ownership check
  name: string;
  description: string;
  targetCount: number;
}

export interface GetHabitDto {
  habitId: string;
  userId: string; // ownership check
}

export interface ListHabitsDto {
  userId: string;
  status?: 'active' | 'paused' | 'archived';
  page?: number;
  pageSize?: number;
}

export interface ArchiveHabitDto {
  habitId: string;
  userId: string;
}

// ─── Output DTOs (returned by use cases) ────────────────────────────────────

export interface HabitResponseDto {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequencyType: FrequencyType;
  timesPerWeek: number;
  targetCount: number;
  status: 'active' | 'paused' | 'archived';
  streakCount: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedHabitsDto {
  items: HabitResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
