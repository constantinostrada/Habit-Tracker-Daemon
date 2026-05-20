"""
Database
========
Asyncpg connection pool management for the analytics service.
"""

from typing import AsyncGenerator

import asyncpg

from app.config import get_settings

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        settings = get_settings()
        _pool = await asyncpg.create_pool(
            host=settings.postgres_host,
            port=settings.postgres_port,
            database=settings.postgres_db,
            user=settings.postgres_user,
            password=settings.postgres_password,
            min_size=2,
            max_size=10,
        )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """FastAPI dependency that yields a single DB connection from the pool."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn  # type: ignore[misc]
