"""
Habit-Tracker-Daemon — Analytics Service (FastAPI)
===================================================
Entry point for the Python analytics microservice.
Provides read-only analytics endpoints backed by PostgreSQL.

Run with: uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import close_pool, get_pool
from app.routers import analytics, health


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle hooks."""
    # Warm up the connection pool on startup
    await get_pool()
    yield
    # Drain the pool on shutdown
    await close_pool()


settings = get_settings()

app = FastAPI(
    title="Habit-Tracker-Daemon Analytics",
    description="Read-only analytics and reporting service for the Habit Tracker.",
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(analytics.router)


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred.",
            "status_code": 500,
        },
    )


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    return {
        "service": "habit-tracker-analytics",
        "version": "1.0.0",
        "status": "running",
    }
