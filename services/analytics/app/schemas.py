"""
Schemas (Pydantic models)
=========================
Request/response models for the analytics API.
"""

from datetime import datetime

from pydantic import BaseModel, Field


# ── Response models ────────────────────────────────────────────────────────────

class DailyCompletionPoint(BaseModel):
    date: str = Field(..., description="Calendar date in YYYY-MM-DD format")
    count: int = Field(..., ge=0)


class HabitHeatmapResponse(BaseModel):
    habit_id: str
    user_id: str
    year: int
    data: list[DailyCompletionPoint]


class UserSummaryResponse(BaseModel):
    user_id: str
    total_habits: int
    active_habits: int
    total_completions: int
    avg_streak: float
    best_streak: int
    generated_at: datetime


class TopHabit(BaseModel):
    habit_id: str
    name: str
    streak_count: int
    total_completions: int


class TopHabitsResponse(BaseModel):
    user_id: str
    habits: list[TopHabit]


class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
