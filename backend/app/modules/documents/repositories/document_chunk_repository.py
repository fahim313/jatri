from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

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

    async def delete_by_document_id(self, document_id: int) -> None:
        await self.session.execute(
            delete(DocumentChunk).where(
                DocumentChunk.document_id == document_id
            )
        )
        await self.session.flush()