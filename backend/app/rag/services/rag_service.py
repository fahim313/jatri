from sqlalchemy.ext.asyncio import AsyncSession

from app.rag.schemas import RAGResult, RAGSource
from app.rag.services.context_builder import ContextBuilder
from app.rag.services.retrieval_service import RetrievalService


class RAGService:
    def __init__(self, session: AsyncSession) -> None:
        self.retrieval_service: RetrievalService = RetrievalService(session)
        self.context_builder: ContextBuilder = ContextBuilder()

    async def retrieve_context(
        self,
        query: str,
        top_k: int = 5,
    ) -> RAGResult:
        chunks = await self.retrieval_service.retrieve(
            query=query,
            top_k=top_k,
        )

        context = self.context_builder.build(chunks)

        sources: list[RAGSource] = [
            {
                "document_id": chunk["document_id"],
                "document_title": chunk["document_title"],
                "page_number": chunk["page_number"],
                "chunk_id": chunk["id"],
            }
            for chunk in chunks
        ]

        return {
            "context": context,
            "sources": sources,
            "retrieved_count": len(chunks),
        }