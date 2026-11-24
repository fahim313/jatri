from typing import Annotated

from fastapi import Depends

from app.db.session import SessionDep
from app.integrations.embeddings.client import GeminiEmbeddingClient
from app.integrations.embeddings.dependencies import get_embedding_client
from app.modules.documents.repositories.document_chunk_repository import (
    DocumentChunkRepository,
)
from app.modules.documents.repositories.document_repository import (
    DocumentRepository,
)
from app.modules.documents.services.document_service import DocumentService


def get_document_service(
    session: SessionDep,
    embedding_client: Annotated[
        GeminiEmbeddingClient,
        Depends(get_embedding_client),
    ],
) -> DocumentService:
    document_repository = DocumentRepository(session)
    chunk_repository = DocumentChunkRepository(session)

    return DocumentService(
        document_repository=document_repository,
        chunk_repository=chunk_repository,
        embedding_client=embedding_client,
    )


DocumentServiceDep = Annotated[
    DocumentService,
    Depends(get_document_service),
]