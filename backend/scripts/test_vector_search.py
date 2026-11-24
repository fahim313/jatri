import asyncio

from sqlalchemy import text

from app.db.session import SessionLocal
from app.integrations.embeddings.dependencies import get_embedding_client

SEARCH_QUERY = "What documents should a worker keep before travelling abroad?"

SEARCH_SQL = text("""
    SELECT
        dc.id,
        d.title,
        dc.page_number,
        dc.chunk_index,
        dc.content,
        1 - (dc.embedding <=> CAST(:query_embedding AS vector)) AS similarity
    FROM document_chunks AS dc
    JOIN documents AS d ON d.id = dc.document_id
    WHERE d.status = 'Approved'
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> CAST(:query_embedding AS vector)
    LIMIT 5
""")


async def main():
    embedding_client = get_embedding_client()

    query_embedding = await embedding_client.embed_query(SEARCH_QUERY)

    print(f"\nQuery: {SEARCH_QUERY}")
    print(f"Query embedding dimensions: {len(query_embedding)}")

    async with SessionLocal() as session:
        result = await session.execute(
            SEARCH_SQL,
            {"query_embedding": str(query_embedding)},
        )

        rows = result.mappings().all()

        if not rows:
            print("\nNo matching approved document chunks found.")
            return

        print("\nRetrieved chunks:")

        for row in rows:
            print("\n" + "=" * 60)
            print(f"Chunk ID: {row['id']}")
            print(f"Document: {row['title']}")
            print(f"Page: {row['page_number']}")
            print(f"Chunk Index: {row['chunk_index']}")
            print(f"Similarity: {row['similarity']:.4f}")
            print(f"Content: {row['content']}")


if __name__ == "__main__":
    asyncio.run(main())
