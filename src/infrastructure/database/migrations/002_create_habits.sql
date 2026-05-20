-- Migration: 002_create_habits
-- Creates the habits table.

CREATE TABLE IF NOT EXISTS habits (
  id              UUID        PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  frequency_type  TEXT        NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'custom')),
  times_per_week  INTEGER     NOT NULL DEFAULT 7,
  target_count    INTEGER     NOT NULL DEFAULT 1,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'paused', 'archived')),
  streak_count    INTEGER     NOT NULL DEFAULT 0,
  longest_streak  INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id        ON habits (user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id_status ON habits (user_id, status);
