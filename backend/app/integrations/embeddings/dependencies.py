from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from app.integrations.embeddings.client import GeminiEmbeddingClient


@lru_cache
def get_embedding_client() -> GeminiEmbeddingClient:
    return GeminiEmbeddingClient()


EmbeddingDep = Annotated[
    GeminiEmbeddingClient,
    Depends(get_embedding_client),
]
