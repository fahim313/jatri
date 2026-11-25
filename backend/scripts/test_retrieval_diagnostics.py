import asyncio

from app.db.session import SessionLocal
from app.integrations.embeddings.dependencies import get_embedding_client
from app.modules.documents.repositories.document_chunk_repository import (
    DocumentChunkRepository,
)

SEARCH_QUERY = "What is the expected behavior of document upload?"


async def main():
    print(f"\nQuery: {SEARCH_QUERY}")

    embedding_client = get_embedding_client()
    query_embedding = await embedding_client.embed_query(SEARCH_QUERY)

    async with SessionLocal() as session:
        repository = DocumentChunkRepository(session)

        vector_results = await repository.search_similar_chunks(
            query_embedding=query_embedding,
            top_k=5,
        )

        keyword_results = await repository.search_keyword_chunks(
            search_query=SEARCH_QUERY,
            top_k=5,
        )

        for search_name, results in (
            ("VECTOR SEARCH", vector_results),
            ("KEYWORD SEARCH", keyword_results),
        ):
            print(f"\n{'=' * 60}")
            print(search_name)

            if not results:
                print("No results found.")
                continue

            for result in results:
                print(f"\nChunk ID: {result['id']}")
                print(f"Document ID: {result['document_id']}")
                print(f"Score: {result['similarity']:.6f}")
                print(f"Content: {result['content']}")


if __name__ == "__main__":
    asyncio.run(main())