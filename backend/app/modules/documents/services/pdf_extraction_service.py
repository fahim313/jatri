import asyncio
import logging
from pathlib import Path
from typing import TypedDict

from pypdf import PdfReader
from pypdf.errors import PyPdfError

logger = logging.getLogger(__name__)

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
MAX_PAGES = 200
PDF_MAGIC = b"%PDF-"


class PDFExtractionError(Exception):
    """Raised when PDF text extraction fails."""


class ExtractedPage(TypedDict):
    page_number: int
    text: str


def _validate_file(path: Path) -> None:
    """Validate file existence, type, size, and PDF signature."""
    if not path.exists():
        logger.warning("PDF file not found: %s", path.name)
        raise PDFExtractionError("PDF file not found.")

    if not path.is_file():
        logger.warning("Invalid PDF file: %s", path.name)
        raise PDFExtractionError("Invalid PDF file path.")

    if path.suffix.lower() != ".pdf":
        raise PDFExtractionError("Only PDF files are supported.")

    try:
        size = path.stat().st_size

        if size == 0:
            raise PDFExtractionError("PDF file is empty.")

        if size > MAX_FILE_SIZE_BYTES:
            raise PDFExtractionError(
                f"PDF file is too large. Maximum size is "
                f"{MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
            )

        with path.open("rb") as file:
            header = file.read(1024)

    except OSError as exc:
        logger.exception("Unable to access PDF file: %s", path.name)
        raise PDFExtractionError("Unable to read PDF file.") from exc

    if PDF_MAGIC not in header:
        raise PDFExtractionError("The file is not a valid PDF.")


def extract_pdf_text(file_path: str | Path) -> list[ExtractedPage]:
    """
    Extract text from each PDF page.

    Pages without extractable text are skipped.

    Returns:
        A list containing page numbers and extracted text.

    Raises:
        PDFExtractionError: If the file is invalid or extraction fails.
    """
    path = Path(file_path)

    _validate_file(path)

    try:
        reader = PdfReader(path, strict=False)

        if reader.is_encrypted:
            try:
                decrypted = reader.decrypt("")
            except Exception as exc:
                logger.exception("PDF decryption failed: %s", path.name)
                raise PDFExtractionError(
                    "Unable to decrypt the PDF file."
                ) from exc

            if not decrypted:
                raise PDFExtractionError(
                    "Password-protected PDF is not supported."
                )

        total_pages = len(reader.pages)

        if total_pages == 0:
            raise PDFExtractionError("PDF contains no pages.")

        if total_pages > MAX_PAGES:
            raise PDFExtractionError(
                f"PDF has too many pages. Maximum is {MAX_PAGES} pages."
            )

        extracted_pages: list[ExtractedPage] = []

        for page_number, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text() or ""
            except Exception as exc:
                logger.exception(
                    "Failed to extract text from page %s of %s",
                    page_number,
                    path.name,
                )
                raise PDFExtractionError(
                    f"Failed to extract text from page {page_number}."
                ) from exc

            text = text.strip()

            if not text:
                continue

            extracted_pages.append(
                {
                    "page_number": page_number,
                    "text": text,
                }
            )

        if not extracted_pages:
            raise PDFExtractionError(
                "No extractable text found. The PDF may contain scanned images."
            )

        return extracted_pages

    except PDFExtractionError:
        raise
    except (PyPdfError, OSError, ValueError, KeyError, RecursionError) as exc:
        logger.exception("Unable to read PDF file: %s", path.name)
        raise PDFExtractionError("Unable to read PDF file.") from exc
    except Exception as exc:
        logger.exception("Unexpected error while reading PDF: %s", path.name)
        raise PDFExtractionError("Unable to read PDF file.") from exc


async def extract_pdf_text_async(
    file_path: str | Path,
) -> list[ExtractedPage]:
    """Extract PDF text without blocking the event loop."""
    return await asyncio.to_thread(extract_pdf_text, file_path)
