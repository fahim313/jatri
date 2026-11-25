import asyncio

from app.db.session import SessionLocal
from app.modules.documents.repositories.document_chunk_repository import (
    DocumentChunkRepository,
)

SEARCH_QUERY = "passport visa"


async def main():
    print(f"\nQuery: {SEARCH_QUERY}")

    async with SessionLocal() as session:
        repository = DocumentChunkRepository(session)

        rows = await repository.search_keyword_chunks(
            search_query=SEARCH_QUERY,
            top_k=5,
        )

        if not rows:
            print("\nNo matching approved document chunks found.")
            return

        print("\nRetrieved chunks:")

        for row in rows:
            print("\n" + "=" * 60)
            print(f"Chunk ID: {row['id']}")
            print(f"Document ID: {row['document_id']}")
            print(f"Document: {row['document_title']}")
            print(f"Page: {row['page_number']}")
            print(f"Chunk Index: {row['chunk_index']}")
            print(f"Similarity: {row['similarity']:.4f}")
            print(f"Content: {row['content']}")


if __name__ == "__main__":
    asyncio.run(main())