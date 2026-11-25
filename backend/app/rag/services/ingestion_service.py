from app.integrations.embeddings.client import GeminiEmbeddingClient
from app.modules.documents.services.chunking_service import (
    TextChunk,
    chunk_extracted_pages,
)
from app.modules.documents.services.pdf_extraction_service import (
    extract_pdf_text_async,
)
from app.rag.schemas import IngestedChunk


class IngestionService:
    def __init__(
        self,
        embedding_client: GeminiEmbeddingClient,
    ) -> None:
        self.embedding_client: GeminiEmbeddingClient = embedding_client

    async def ingest(
        self,
        file_path: str,
    ) -> list[IngestedChunk]:
        extracted_pages = await extract_pdf_text_async(file_path)

        chunks: list[TextChunk] = chunk_extracted_pages(extracted_pages)

        if not chunks:
            return []

        embeddings = await self.embedding_client.embed_documents(
            [chunk["content"] for chunk in chunks]
        )

        if len(embeddings) != len(chunks):
            raise ValueError(
                "Embedding count does not match chunk count."
            )

        return [
            {
                **chunk,
                "embedding": embedding,
            }
            for chunk, embedding in zip(
                chunks,
                embeddings,
                strict=True,
            )
        ]