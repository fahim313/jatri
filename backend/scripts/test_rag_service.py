import asyncio

from app.db.session import SessionLocal
from app.rag.services.rag_service import RAGService

SEARCH_QUERY = "What documents should a worker keep before travelling abroad?"


async def main():
    print(f"\nQuery: {SEARCH_QUERY}")

    async with SessionLocal() as session:
        service = RAGService(session)

        result = await service.retrieve_context(
            query=SEARCH_QUERY,
            top_k=5,
        )

        print("\nRetrieved Count:", result["retrieved_count"])

        print("\nContext:")
        print(result["context"])

        print("\nSources:")

        for source in result["sources"]:
            print(
                f"Document: {source['document_title']} | "
                f"Page: {source['page_number']} | "
                f"Chunk ID: {source['chunk_id']}"
            )


if __name__ == "__main__":
    asyncio.run(main())