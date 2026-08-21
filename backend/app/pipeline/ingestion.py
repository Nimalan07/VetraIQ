import logging
import uuid
from pathlib import Path
from typing import Dict

from app.utils.pdf_utils import extract_pdf_text


logger = logging.getLogger(__name__)


def ingest_pdf(
    pdf_path: str,
) -> Dict[str, object]:
    """
    Ingest a PDF and extract raw text.

    Returns metadata that later stages of the pipeline
    can use.
    """

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(
            f"File does not exist: {pdf_path}"
        )

    if path.suffix.lower() != ".pdf":
        raise ValueError(
            "Only PDF files are supported by this endpoint."
        )

    product_id = str(uuid.uuid4())

    logger.info(
        "Starting PDF ingestion: %s",
        path.name,
    )

    text = extract_pdf_text(
        str(path)
    )

    if not text.strip():
        raise ValueError(
            "No extractable text found in PDF. "
            "The document may be image-only/scanned."
        )

    logger.info(
        "PDF ingestion completed: %s",
        path.name,
    )

    return {
        "product_id": product_id,
        "source_type": "pdf",
        "source_reference": path.name,
        "file_path": str(path),
        "text": text,
    }
