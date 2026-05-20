-- Migration: 003_create_habit_logs
-- Creates the habit_logs table for tracking daily completions.

CREATE TABLE IF NOT EXISTS habit_logs (
  id            UUID        PRIMARY KEY,
  habit_id      UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note          TEXT        NOT NULL DEFAULT '',
  count         INTEGER     NOT NULL DEFAULT 1,
  -- Prevent duplicate logs on the same calendar day per habit
  CONSTRAINT uq_habit_log_day UNIQUE (habit_id, DATE(completed_at))
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id     ON habit_logs (habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id      ON habit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs (completed_at);
