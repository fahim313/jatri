from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.documents.models.document import Document
from app.modules.documents.models.document_chunk import DocumentChunk


class DocumentChunkRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_many(
        self,
        chunks_data: list[dict],
    ) -> list[DocumentChunk]:
        if not chunks_data:
            return []

        chunks = [
            DocumentChunk(**chunk_data)
            for chunk_data in chunks_data
        ]

        self.session.add_all(chunks)
        await self.session.flush()

        return chunks

    async def get_by_document_id(
        self,
        document_id: int,
    ) -> list[DocumentChunk]:
        result = await self.session.execute(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
        )

        return list(result.scalars().all())

    async def search_similar_chunks(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[dict]:
        similarity = (
            1 - DocumentChunk.embedding.cosine_distance(query_embedding)
        ).label("similarity")

        query = (
            select(
                DocumentChunk.id,
                DocumentChunk.document_id,
                Document.title.label("document_title"),
                DocumentChunk.content,
                DocumentChunk.page_number,
                DocumentChunk.chunk_index,
                similarity,
            )
            .join(
                Document,
                Document.id == DocumentChunk.document_id,
            )
            .where(
                Document.status == "Approved",
                DocumentChunk.embedding.is_not(None),
            )
            .order_by(
                DocumentChunk.embedding.cosine_distance(query_embedding)
            )
            .limit(top_k)
        )

        result = await self.session.execute(query)

        return [dict(row) for row in result.mappings().all()]

    async def search_keyword_chunks(
        self,
        search_query: str,
        top_k: int = 5,
    ) -> list[dict]:
        search_vector = func.websearch_to_tsquery(
            "simple",
            search_query,
        )

        rank = func.ts_rank(
            DocumentChunk.search_vector,
            search_vector,
        ).label("similarity")

        query = (
            select(
                DocumentChunk.id,
                DocumentChunk.document_id,
                Document.title.label("document_title"),
                DocumentChunk.content,
                DocumentChunk.page_number,
                DocumentChunk.chunk_index,
                rank,
            )
            .join(
                Document,
                Document.id == DocumentChunk.document_id,
            )
            .where(
                Document.status == "Approved",
                DocumentChunk.search_vector.op("@@")(search_vector),
            )
            .order_by(rank.desc())
            .limit(top_k)
        )

        result = await self.session.execute(query)

        return [dict(row) for row in result.mappings().all()]

    async def delete_by_document_id(self, document_id: int) -> None:
        await self.session.execute(
            delete(DocumentChunk).where(
                DocumentChunk.document_id == document_id
            )
        )
        await self.session.flush()