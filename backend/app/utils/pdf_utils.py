from pathlib import Path
from typing import List, Dict

import fitz


def extract_pdf_pages(
    pdf_path: str,
) -> List[Dict[str, object]]:
    """
    Extract text from every PDF page while preserving
    page-level source information.
    """

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(
            f"PDF not found: {pdf_path}"
        )

    pages = []

    document = fitz.open(pdf_path)

    try:
        for page_number, page in enumerate(
            document,
            start=1,
        ):
            text = page.get_text("text")

            pages.append(
                {
                    "page": page_number,
                    "text": text.strip(),
                }
            )

    finally:
        document.close()

    return pages


def extract_pdf_text(
    pdf_path: str,
) -> str:
    """
    Extract the complete text from a PDF.
    """

    pages = extract_pdf_pages(pdf_path)

    page_texts = []

    for page in pages:

        page_number = page["page"]
        text = page["text"]

        page_texts.append(
            f"[PAGE {page_number}]\n{text}"
        )

    return "\n\n".join(page_texts)
