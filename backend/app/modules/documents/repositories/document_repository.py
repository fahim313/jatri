from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.documents.models.document import Document


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, document_data: dict) -> Document:
        document = Document(**document_data)

        self.session.add(document)
        await self.session.flush()
        await self.session.refresh(document)

        return document

    async def get_by_id(self, document_id: int) -> Document | None:
        result = await self.session.execute(
            select(Document).where(Document.id == document_id)
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        status: str | None = None,
        search: str | None = None,
    ) -> list[Document]:
        query = select(Document)

        if status:
            query = query.where(Document.status == status)

        if search:
            query = query.where(
                Document.title.ilike(f"%{search}%")
                | Document.file_name.ilike(f"%{search}%")
            )

        query = query.order_by(Document.id.desc())

        result = await self.session.execute(query)

        return list(result.scalars().all())

    async def update(
        self,
        document: Document,
        document_data: dict,
    ) -> Document:
        for field, value in document_data.items():
            setattr(document, field, value)

        await self.session.flush()
        await self.session.refresh(document)

        return document

    async def approve(
        self,
        document: Document,
        reviewer_id: int,
    ) -> Document:
        document.status = "Approved"
        document.reviewed_by = reviewer_id
        document.reviewed_at = datetime.now(UTC)
        document.rejection_reason = None

        await self.session.flush()
        await self.session.refresh(document)

        return document

    async def reject(
        self,
        document: Document,
        reviewer_id: int,
        reason: str,
    ) -> Document:
        document.status = "Rejected"
        document.reviewed_by = reviewer_id
        document.reviewed_at = datetime.now(UTC)
        document.rejection_reason = reason

        await self.session.flush()
        await self.session.refresh(document)

        return document

    async def delete(self, document: Document) -> None:
        await self.session.delete(document)
        await self.session.flush()