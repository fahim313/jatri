import asyncio
import logging
import math
from typing import Literal

from google import genai
from google.genai import errors, types

from app.core.config import settings
from app.core.exceptions.errors import EmbeddingUnavailableError

logger = logging.getLogger(__name__)

EmbeddingTaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]

SUPPORTED_TASK_TYPES = {"RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"}

BATCH_SIZE = 50
MAX_ATTEMPTS = 3
BASE_RETRY_DELAY_SECONDS = 1.0
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
REQUEST_TIMEOUT_MS = 30_000


def _normalize(vector: list[float]) -> list[float]:
    """Normalize a vector to unit length."""
    norm = math.sqrt(sum(value * value for value in vector))

    if norm == 0:
        return vector

    return [value / norm for value in vector]


class GeminiEmbeddingClient:
    def __init__(self) -> None:
        api_key = settings.GEMINI_API_KEY.get_secret_value()

        if not api_key:
            raise EmbeddingUnavailableError()

        self.client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=REQUEST_TIMEOUT_MS,
            ),
        )
        self.model = settings.GEMINI_EMBEDDING_MODEL
        self.dimension = settings.GEMINI_EMBEDDING_DIMENSION

    async def embed_texts(
        self,
        texts: list[str],
        task_type: EmbeddingTaskType = "RETRIEVAL_DOCUMENT",
    ) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not texts:
            return []

        if task_type not in SUPPORTED_TASK_TYPES:
            raise ValueError("Unsupported embedding task type.")

        if any(not text.strip() for text in texts):
            raise ValueError("Input texts must not be empty.")

        embeddings: list[list[float]] = []

        for start in range(0, len(texts), BATCH_SIZE):
            batch = texts[start : start + BATCH_SIZE]

            batch_embeddings = await self._embed_batch(
                batch=batch,
                task_type=task_type,
            )

            embeddings.extend(batch_embeddings)

        if len(embeddings) != len(texts):
            logger.error(
                "Embedding count mismatch: expected %s, received %s.",
                len(texts),
                len(embeddings),
            )
            raise EmbeddingUnavailableError()

        return embeddings

    async def _embed_batch(
        self,
        batch: list[str],
        task_type: EmbeddingTaskType,
    ) -> list[list[float]]:
        """Generate embeddings for one batch with retry support."""
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                response = await self.client.aio.models.embed_content(
                    model=self.model,
                    contents=batch,
                    config=types.EmbedContentConfig(
                        task_type=task_type,
                        output_dimensionality=self.dimension,
                    ),
                )

                return self._parse_response(
                    response=response,
                    expected_count=len(batch),
                )

            except EmbeddingUnavailableError:
                raise

            except errors.APIError as exc:
                is_retryable = exc.code in RETRYABLE_STATUS_CODES

                if not is_retryable or attempt == MAX_ATTEMPTS:
                    logger.exception(
                        "Embedding API request failed with status %s.",
                        exc.code,
                    )
                    raise EmbeddingUnavailableError() from exc

                await self._wait_before_retry(
                    attempt=attempt,
                    reason=f"status {exc.code}",
                )

            except (TimeoutError, ConnectionError) as exc:
                if attempt == MAX_ATTEMPTS:
                    logger.exception(
                        "Embedding request timed out or connection failed."
                    )
                    raise EmbeddingUnavailableError() from exc

                await self._wait_before_retry(
                    attempt=attempt,
                    reason=type(exc).__name__,
                )

            except Exception as exc:
                logger.exception("Embedding generation failed.")
                raise EmbeddingUnavailableError() from exc

        raise EmbeddingUnavailableError()

    def _parse_response(
        self,
        response: types.EmbedContentResponse,
        expected_count: int,
    ) -> list[list[float]]:
        """Validate the API response and return normalized vectors."""
        if not response.embeddings:
            logger.error("Embedding response contained no embeddings.")
            raise EmbeddingUnavailableError()

        if len(response.embeddings) != expected_count:
            logger.error(
                "Embedding batch size mismatch: expected %s, received %s.",
                expected_count,
                len(response.embeddings),
            )
            raise EmbeddingUnavailableError()

        vectors: list[list[float]] = []

        for item in response.embeddings:
            if item.values is None:
                logger.error("Embedding response contained empty values.")
                raise EmbeddingUnavailableError()

            if len(item.values) != self.dimension:
                logger.error(
                    "Unexpected embedding dimension: expected %s, received %s.",
                    self.dimension,
                    len(item.values),
                )
                raise EmbeddingUnavailableError()

            vector = list(item.values)

            if not all(math.isfinite(value) for value in vector):
                logger.error("Embedding response contained non-finite values.")
                raise EmbeddingUnavailableError()

            vectors.append(_normalize(vector))

        return vectors

    @staticmethod
    async def _wait_before_retry(
        attempt: int,
        reason: str,
    ) -> None:
        delay = BASE_RETRY_DELAY_SECONDS * (2 ** (attempt - 1))

        logger.warning(
            "Embedding request failed (%s). Retrying in %.1f seconds "
            "(attempt %s/%s).",
            reason,
            delay,
            attempt,
            MAX_ATTEMPTS,
        )

        await asyncio.sleep(delay)

    async def embed_documents(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """Generate embeddings for document chunks."""
        return await self.embed_texts(
            texts=texts,
            task_type="RETRIEVAL_DOCUMENT",
        )

    async def embed_query(
        self,
        text: str,
    ) -> list[float]:
        """Generate an embedding for a search query."""
        embeddings = await self.embed_texts(
            texts=[text],
            task_type="RETRIEVAL_QUERY",
        )

        return embeddings[0]
