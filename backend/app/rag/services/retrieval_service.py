from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.documents.services.hybrid_search_service import (
    HybridSearchService,
)
from app.rag.schemas import RetrievedChunk


class RetrievalService:
    def __init__(self, session: AsyncSession) -> None:
        self.hybrid_search_service: HybridSearchService = HybridSearchService(session)

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[RetrievedChunk]:
        query = query.strip()

        if not query:
            return []

        return await self.hybrid_search_service.search(
            query=query,
            top_k=top_k,
        )