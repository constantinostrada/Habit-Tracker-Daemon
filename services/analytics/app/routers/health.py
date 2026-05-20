"""
Health Router
=============
Liveness and readiness probes for the Python analytics service.
"""

from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends

from app.database import get_connection

router = APIRouter(prefix="/health", tags=["health"])

DbConn = Annotated[asyncpg.Connection, Depends(get_connection)]


@router.get("/live")
async def liveness() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
async def readiness(conn: DbConn) -> dict[str, str]:
    await conn.fetchval("SELECT 1")
    return {"status": "ok", "db": "connected"}
