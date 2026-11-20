from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "jatri-api",
        "version": "v1",
    }


@api_router.get("/health/db", tags=["Health"])
async def database_health_check(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    await session.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected",
    }