import asyncio
from unittest.mock import patch

from app.agents.tools.migrant_tools import create_migrant_tools
from app.db.session import SessionLocal
from app.rag.services.rag_service import RAGService


async def simulate_rag_error(*args, **kwargs):
    raise RuntimeError("Simulated RAG service failure")


async def main():
    async with SessionLocal() as session:
        with patch.object(
            RAGService,
            "retrieve_context",
            new=simulate_rag_error,
        ):
            tools = create_migrant_tools(session)
            migrant_tool = tools[0]

            result = await migrant_tool.ainvoke(
                {
                    "query": "What documents should a migrant worker keep?"
                }
            )

            print("\nTool Error Test Result:")
            print(result)

            assert result["status"] == "error"
            assert result["context"] == ""
            assert result["sources"] == []
            assert result["retrieved_count"] == 0

            print("\nError handling test passed!")


if __name__ == "__main__":
    asyncio.run(main())