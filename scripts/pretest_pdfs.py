from pathlib import Path
import sys

import fitz


PROJECT_ROOT = Path(
    __file__
).resolve().parents[1]

PDF_ROOT = (
    PROJECT_ROOT
    / "sample_data"
    / "pdfs"
)


def check_pdf(pdf_path: Path):

    try:

        document = fitz.open(
            str(pdf_path)
        )

        total_text = 0

        for page in document:

            text = page.get_text(
                "text"
            )

            total_text += len(
                text.strip()
            )

        page_count = len(
            document
        )

        document.close()

        if total_text == 0:

            print(
                f"[WARN] SCANNED/IMAGE PDF | "
                f"{pdf_path.name} | "
                f"pages={page_count} | "
                f"text=0"
            )

            return False

        print(
            f"[OK] | "
            f"{pdf_path.name} | "
            f"pages={page_count} | "
            f"text={total_text} chars"
        )

        return True

    except Exception as exc:

        print(
            f"[ERROR] | "
            f"{pdf_path.name} | "
            f"{exc}"
        )

        return False


def main():

    if not PDF_ROOT.exists():

        print(
            f"PDF directory not found:\n"
            f"{PDF_ROOT}"
        )

        sys.exit(1)

    pdfs = list(
        PDF_ROOT.rglob("*.pdf")
    )

    if not pdfs:

        print(
            "No PDF files found."
        )

        return

    print(
        f"Found {len(pdfs)} PDF(s).\n"
    )

    passed = 0

    for pdf in pdfs:

        if check_pdf(pdf):
            passed += 1

    print(
        "\n-------------------------"
    )

    print(
        f"Total:  {len(pdfs)}"
    )

    print(
        f"Passed: {passed}"
    )

    print(
        f"Failed: {len(pdfs) - passed}"
    )


if __name__ == "__main__":
    main()
