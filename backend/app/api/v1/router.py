from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.modules.agencies.router import router as agencies_router
from app.modules.auth.router import router as auth_router
from app.modules.chat.router import router as chat_router
from app.modules.jobs.router import public_router
from app.modules.jobs.router import router as jobs_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(agencies_router)
api_router.include_router(jobs_router)
api_router.include_router(public_router)
api_router.include_router(
    chat_router,
    prefix="/chat",
)

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
