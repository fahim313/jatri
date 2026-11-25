from app.rag.schemas import RetrievedChunk


class ContextBuilder:
    def build(self, chunks: list[RetrievedChunk]) -> str:
        if not chunks:
            return "No relevant information found in the available documents."

        context_parts: list[str] = []

        for index, chunk in enumerate(chunks, start=1):
            document_title = chunk["document_title"]
            page_number = chunk["page_number"]
            content = chunk["content"].strip()

            if not content:
                continue

            source_context = (
                f"[Source {index}]\n"
                f"Document: {document_title}\n"
                f"Page: {page_number}\n"
                f"Content:\n{content}"
            )

            context_parts.append(source_context)

        if not context_parts:
            return "No relevant information found in the available documents."

        return "\n\n---\n\n".join(context_parts)