from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal


@asynccontextmanager
async def get_mcp_session() -> AsyncGenerator[AsyncSession]:
    async with SessionLocal() as session:
        yield session