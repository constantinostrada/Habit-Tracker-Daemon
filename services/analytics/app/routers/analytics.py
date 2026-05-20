"""
Analytics Router
================
FastAPI routes for habit analytics and reporting.
Reads directly from PostgreSQL (read-only analytics queries).
"""

from datetime import datetime, timezone
from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.auth import CurrentUser
from app.database import get_connection
from app.schemas import (
    DailyCompletionPoint,
    HabitHeatmapResponse,
    TopHabit,
    TopHabitsResponse,
    UserSummaryResponse,
)

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

DbConn = Annotated[asyncpg.Connection, Depends(get_connection)]


@router.get("/summary", response_model=UserSummaryResponse)
async def get_user_summary(current_user: CurrentUser, conn: DbConn) -> UserSummaryResponse:
    """
    Return a high-level summary for the authenticated user:
    total habits, active habits, completions, and streak stats.
    """
    row = await conn.fetchrow(
        """
        SELECT
            COUNT(*)                                         AS total_habits,
            COUNT(*) FILTER (WHERE status = 'active')        AS active_habits,
            COALESCE(MAX(longest_streak), 0)                 AS best_streak,
            COALESCE(AVG(streak_count)::numeric(5,2), 0)     AS avg_streak
        FROM habits
        WHERE user_id = $1
        """,
        current_user.user_id,
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    completions_row = await conn.fetchrow(
        "SELECT COUNT(*) AS total FROM habit_logs WHERE user_id = $1",
        current_user.user_id,
    )

    return UserSummaryResponse(
        user_id=current_user.user_id,
        total_habits=row["total_habits"],
        active_habits=row["active_habits"],
        total_completions=completions_row["total"] if completions_row else 0,
        avg_streak=float(row["avg_streak"]),
        best_streak=row["best_streak"],
        generated_at=datetime.now(tz=timezone.utc),
    )


@router.get("/habits/{habit_id}/heatmap", response_model=HabitHeatmapResponse)
async def get_habit_heatmap(
    current_user: CurrentUser,
    conn: DbConn,
    habit_id: str = Path(..., description="UUID of the habit"),
    year: int = Query(default=datetime.now().year, ge=2020, le=2100),
) -> HabitHeatmapResponse:
    """
    Return daily completion counts for a habit in a given year.
    Used to render a GitHub-style contribution heatmap.
    """
    # Ownership check
    habit = await conn.fetchrow(
        "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
        habit_id,
        current_user.user_id,
    )
    if habit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found.")

    rows = await conn.fetch(
        """
        SELECT
            TO_CHAR(completed_at, 'YYYY-MM-DD') AS date,
            SUM(count)::int                     AS count
        FROM habit_logs
        WHERE habit_id = $1
          AND EXTRACT(YEAR FROM completed_at) = $2
        GROUP BY date
        ORDER BY date
        """,
        habit_id,
        year,
    )

    data = [DailyCompletionPoint(date=r["date"], count=r["count"]) for r in rows]

    return HabitHeatmapResponse(
        habit_id=habit_id,
        user_id=current_user.user_id,
        year=year,
        data=data,
    )


@router.get("/top-habits", response_model=TopHabitsResponse)
async def get_top_habits(
    current_user: CurrentUser,
    conn: DbConn,
    limit: int = Query(default=5, ge=1, le=20),
) -> TopHabitsResponse:
    """
    Return the user's top habits ranked by current streak count.
    """
    rows = await conn.fetch(
        """
        SELECT id, name, streak_count,
               (SELECT COUNT(*) FROM habit_logs hl WHERE hl.habit_id = h.id)::int AS total_completions
        FROM habits h
        WHERE user_id = $1
          AND status = 'active'
        ORDER BY streak_count DESC
        LIMIT $2
        """,
        current_user.user_id,
        limit,
    )

    habits = [
        TopHabit(
            habit_id=str(r["id"]),
            name=r["name"],
            streak_count=r["streak_count"],
            total_completions=r["total_completions"],
        )
        for r in rows
    ]

    return TopHabitsResponse(user_id=current_user.user_id, habits=habits)
