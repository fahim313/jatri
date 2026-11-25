from typing import cast

from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.embeddings.dependencies import get_embedding_client
from app.modules.documents.repositories.document_chunk_repository import (
    DocumentChunkRepository,
)
from app.rag.schemas import RetrievedChunk


class HybridSearchService:
    RRF_K = 60

    def __init__(self, session: AsyncSession):
        self.repository = DocumentChunkRepository(session)
        self.embedding_client = get_embedding_client()

    async def search(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[RetrievedChunk]:
        query_embedding = await self.embedding_client.embed_query(query)

        vector_results = await self.repository.search_similar_chunks(
            query_embedding=query_embedding,
            top_k=top_k,
        )

        keyword_results = await self.repository.search_keyword_chunks(
            search_query=query,
            top_k=top_k,
        )

        return self._fuse_results(
            vector_results=vector_results,
            keyword_results=keyword_results,
            top_k=top_k,
        )

    def _fuse_results(
        self,
        vector_results: list[dict],
        keyword_results: list[dict],
        top_k: int,
    ) -> list[RetrievedChunk]:
        fused_results = {}

        for results in (vector_results, keyword_results):
            for rank, result in enumerate(results, start=1):
                chunk_id = result["id"]

                if chunk_id not in fused_results:
                    fused_results[chunk_id] = {
                        **result,
                        "rrf_score": 0.0,
                    }

                fused_results[chunk_id]["rrf_score"] += (
                    1 / (self.RRF_K + rank)
                )

        ranked_results = sorted(
            fused_results.values(),
            key=lambda item: item["rrf_score"],
            reverse=True,
        )

        return cast(
            list[RetrievedChunk],
            ranked_results[:top_k],
        )