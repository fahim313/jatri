from typing import TypedDict

from app.modules.documents.services.pdf_extraction_service import ExtractedPage

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


class TextChunk(TypedDict):
    content: str
    page_number: int
    chunk_index: int


def _validate_chunk_params(chunk_size: int, chunk_overlap: int) -> None:
    if chunk_size <= 0:
        raise ValueError("Chunk size must be greater than zero.")

    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError(
            "Chunk overlap must be non-negative and smaller than chunk size."
        )


def _split_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """Split text into overlapping chunks."""
    _validate_chunk_params(chunk_size, chunk_overlap)

    text = " ".join(text.split())

    if not text:
        return []

    chunks: list[str] = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)

        if end < text_length:
            boundary = text.rfind(" ", start, end)

            if boundary != -1 and boundary - start > chunk_overlap:
                end = boundary

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        next_start = end - chunk_overlap

        if next_start > start and text[next_start - 1] != " ":
            space = text.find(" ", next_start, end)

            if space != -1:
                next_start = space + 1

        start = max(next_start, start + 1)

    return chunks


def chunk_extracted_pages(
    pages: list[ExtractedPage],
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[TextChunk]:
    """
    Split extracted PDF pages into overlapping text chunks.

    Each chunk retains its original PDF page number.
    Chunk indexes are sequential across the document.
    """
    _validate_chunk_params(chunk_size, chunk_overlap)

    result: list[TextChunk] = []
    chunk_index = 0

    for page in pages:
        page_chunks = _split_text(
            text=page["text"],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        for content in page_chunks:
            result.append(
                {
                    "content": content,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                }
            )
            chunk_index += 1

    return result