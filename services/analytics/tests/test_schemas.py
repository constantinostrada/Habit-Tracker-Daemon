"""
Schema validation tests.
"""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas import DailyCompletionPoint, HabitHeatmapResponse, UserSummaryResponse


def test_daily_completion_point_valid() -> None:
    point = DailyCompletionPoint(date="2024-01-15", count=3)
    assert point.date == "2024-01-15"
    assert point.count == 3


def test_daily_completion_point_rejects_negative_count() -> None:
    with pytest.raises(ValidationError):
        DailyCompletionPoint(date="2024-01-15", count=-1)


def test_user_summary_response_valid() -> None:
    summary = UserSummaryResponse(
        user_id="some-uuid",
        total_habits=5,
        active_habits=3,
        total_completions=42,
        avg_streak=2.5,
        best_streak=10,
        generated_at=datetime.now(tz=timezone.utc),
    )
    assert summary.total_habits == 5
    assert summary.avg_streak == 2.5


def test_heatmap_response_valid() -> None:
    heatmap = HabitHeatmapResponse(
        habit_id="habit-uuid",
        user_id="user-uuid",
        year=2024,
        data=[DailyCompletionPoint(date="2024-01-01", count=1)],
    )
    assert len(heatmap.data) == 1
    assert heatmap.year == 2024
