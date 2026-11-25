import logging

from langchain_core.tools import tool
from sqlalchemy.ext.asyncio import AsyncSession

from app.rag.services.rag_service import RAGService

logger = logging.getLogger(__name__)


def create_migrant_tools(session: AsyncSession):
    rag_service = RAGService(session)

    @tool
    async def search_migrant_documents(query: str) -> dict[str, object]:
        """Search approved official Jatri documents for migration-related
        policies, procedures, fees, required documents, and guidelines.

        Use this tool when the user asks for official migration information
        that should be verified from Jatri documents.
        """
        try:
            result = await rag_service.retrieve_context(
                query=query,
                top_k=5,
            )

            return {
                "status": (
                    "found"
                    if result["retrieved_count"] > 0
                    else "not_found"
                ),
                **result,
            }

        except Exception:
            logger.exception(
                "Failed to retrieve migrant document information."
            )

            return {
                "status": "error",
                "context": "",
                "sources": [],
                "retrieved_count": 0,
            }

    return [search_migrant_documents]