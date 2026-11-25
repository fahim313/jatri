import asyncio

from app.db.session import SessionLocal
from app.modules.documents.services.hybrid_search_service import (
    HybridSearchService,
)

SEARCH_QUERY = "Should a worker hand over original passport documents to an unknown person?"


async def main():
    print(f"\nQuery: {SEARCH_QUERY}")

    async with SessionLocal() as session:
        service = HybridSearchService(session)

        results = await service.search(
            query=SEARCH_QUERY,
            top_k=5,
        )

        if not results:
            print("\nNo matching approved document chunks found.")
            return

        print("\nHybrid Search Results:")

        for result in results:
            print("\n" + "=" * 60)
            print(f"Chunk ID: {result['id']}")
            print(f"Document ID: {result['document_id']}")
            print(f"Document: {result['document_title']}")
            print(f"Page: {result['page_number']}")
            print(f"Chunk Index: {result['chunk_index']}")
            print(f"RRF Score: {result['rrf_score']:.6f}")
            print(f"Content: {result['content']}")


if __name__ == "__main__":
    asyncio.run(main())