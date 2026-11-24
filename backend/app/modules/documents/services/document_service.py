import asyncio
import logging
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from pypdf import PdfReader

from app.core.exceptions.errors import ConflictError, NotFoundError
from app.integrations.embeddings.client import GeminiEmbeddingClient
from app.modules.documents.models.document import Document
from app.modules.documents.repositories.document_chunk_repository import (
    DocumentChunkRepository,
)
from app.modules.documents.repositories.document_repository import (
    DocumentRepository,
)
from app.modules.documents.schemas.document_schema import (
    DocumentCreate,
    DocumentReview,
)
from app.modules.documents.services.chunking_service import (
    chunk_extracted_pages,
)
from app.modules.documents.services.pdf_extraction_service import (
    MAX_FILE_SIZE_BYTES,
    PDFExtractionError,
    extract_pdf_text_async,
)

logger = logging.getLogger(__name__)

DOCUMENT_STORAGE_DIR = (
    Path(__file__).resolve().parents[4] / "storage" / "documents"
)


class DocumentService:
    def __init__(
        self,
        document_repository: DocumentRepository,
        chunk_repository: DocumentChunkRepository,
        embedding_client: GeminiEmbeddingClient,
    ):
        self.document_repository = document_repository
        self.chunk_repository = chunk_repository
        self.embedding_client = embedding_client
        self.session = document_repository.session

    async def upload_document(
        self,
        document_data: DocumentCreate,
        file: UploadFile,
        managed_by: int,
    ) -> Document:
        if not file.filename:
            raise ValueError("A PDF filename is required.")

        original_filename = Path(file.filename).name

        if Path(original_filename).suffix.lower() != ".pdf":
            raise ValueError("Only PDF files are supported.")

        file_content = await file.read(MAX_FILE_SIZE_BYTES + 1)

        if not file_content:
            raise ValueError("PDF file is empty.")

        if len(file_content) > MAX_FILE_SIZE_BYTES:
            raise ValueError("PDF file exceeds the maximum allowed size.")

        stored_filename = f"{uuid4().hex}.pdf"
        file_path = DOCUMENT_STORAGE_DIR / stored_filename

        try:
            await asyncio.to_thread(
                DOCUMENT_STORAGE_DIR.mkdir,
                parents=True,
                exist_ok=True,
            )

            await asyncio.to_thread(file_path.write_bytes, file_content)

            extracted_pages = await extract_pdf_text_async(file_path)

            chunks = chunk_extracted_pages(extracted_pages)

            if not chunks:
                raise PDFExtractionError(
                    "No text chunks could be generated from the PDF."
                )

            embeddings = await self.embedding_client.embed_documents(
                [chunk["content"] for chunk in chunks]
            )

            if len(embeddings) != len(chunks):
                raise ValueError("Embedding count does not match chunk count.")

            total_pages = await asyncio.to_thread(
                lambda: len(PdfReader(file_path).pages)
            )

            document = await self.document_repository.create(
                {
                    **document_data.model_dump(),
                    "file_name": original_filename,
                    "file_path": str(file_path),
                    "file_size": len(file_content),
                    "total_pages": total_pages,
                    "status": "Pending",
                    "managed_by": managed_by,
                }
            )

            chunk_records = [
                {
                    "document_id": document.id,
                    "content": chunk["content"],
                    "page_number": chunk["page_number"],
                    "chunk_index": chunk["chunk_index"],
                    "embedding": embedding,
                }
                for chunk, embedding in zip(
                    chunks,
                    embeddings,
                    strict=True,
                )
            ]

            await self.chunk_repository.create_many(chunk_records)

            await self.session.commit()

            logger.info(
                "Document uploaded successfully: document_id=%s, chunks=%s",
                document.id,
                len(chunk_records),
            )

            return document

        except Exception:
            await self.session.rollback()

            try:
                await asyncio.to_thread(
                    file_path.unlink,
                    missing_ok=True,
                )
            except OSError:
                logger.exception(
                    "Failed to remove uploaded file: %s",
                    stored_filename,
                )

            raise

        finally:
            await file.close()

    async def get_document(self, document_id: int) -> Document:
        document = await self.document_repository.get_by_id(document_id)

        if not document:
            raise NotFoundError("Document", str(document_id))

        return document

    async def get_documents(
        self,
        status: str | None = None,
        search: str | None = None,
    ) -> list[Document]:
        return await self.document_repository.get_all(
            status=status,
            search=search,
        )

    async def review_document(
        self,
        document_id: int,
        review_data: DocumentReview,
        reviewer_id: int,
    ) -> Document:
        document = await self.get_document(document_id)

        if document.status != "Pending":
            raise ConflictError(
                "Document",
                f"{document_id} has already been reviewed",
            )

        if review_data.status == "Approved":
            reviewed_document = await self.document_repository.approve(
                document,
                reviewer_id,
            )

        else:
            reason = (review_data.rejection_reason or "").strip()

            if not reason:
                raise ValueError(
                    "A rejection reason is required."
                )

            reviewed_document = await self.document_repository.reject(
                document,
                reviewer_id,
                reason,
            )

        await self.session.commit()

        return reviewed_document

    async def delete_document(self, document_id: int) -> None:
        document = await self.get_document(document_id)

        file_path = Path(document.file_path)

        await self.document_repository.delete(document)
        await self.session.commit()

        try:
            await asyncio.to_thread(
                file_path.unlink,
                missing_ok=True,
            )
        except OSError:
            logger.exception(
                "Document file could not be deleted: document_id=%s",
                document_id,
            )
