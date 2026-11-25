from typing import TypedDict


class IngestedChunk(TypedDict):
    content: str
    page_number: int
    chunk_index: int
    embedding: list[float]


class RetrievedChunk(TypedDict):
    id: int
    document_id: int
    document_title: str
    content: str
    page_number: int
    chunk_index: int
    similarity: float
    rrf_score: float


class RAGSource(TypedDict):
    document_id: int
    document_title: str
    page_number: int
    chunk_id: int


class RAGResult(TypedDict):
    context: str
    sources: list[RAGSource]
    retrieved_count: int