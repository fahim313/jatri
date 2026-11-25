from typing import Annotated

from fastapi import Depends

from app.db.session import SessionDep
from app.rag.services.rag_service import RAGService


def get_rag_service(session: SessionDep) -> RAGService:
    return RAGService(session=session)


RAGServiceDep = Annotated[
    RAGService,
    Depends(get_rag_service),
]