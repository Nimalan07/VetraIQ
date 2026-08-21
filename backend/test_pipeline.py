import json
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.pipeline.ingestion import ingest_pdf
from app.pipeline.normalization import normalize_text
from app.pipeline.extraction import extract_product


def run_pipeline():
    pdf_path = os.path.join(
        "..",
        "sample_data",
        "pdfs",
        "mechanical",
        "swagelok_gb_ball_valve.pdf"
    )

    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        return

    print(f"Ingesting PDF: {pdf_path}")
    ingest_res = ingest_pdf(pdf_path)
    print(f"Extracted raw text length: {len(ingest_res['text'])}")
    print("Normalizing text...")
    normalized = normalize_text(ingest_res['text'])
    print(f"Normalized text length: {len(normalized)}")
    print("Sending to LLM for extraction...")
    try:
        extracted = extract_product(normalized)

        from app.pipeline.enrichment import enrich_missing
        from app.pipeline.validation import validate_product

        print("Enriching missing fields...")
        enriched = enrich_missing(extracted)

        print("Running validation checks...")
        validation = validate_product(enriched)
        enriched["validation"] = validation

        print("\n=== PIPELINE SUCCESS ===")
        print(json.dumps(enriched, indent=2))

        # Save to file
        output_file = os.path.join("..", "swagelok_extraction.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(enriched, f, indent=2)
        print(f"\nSaved results to {output_file}")
    except Exception as exc:
        print("\n=== EXTRACTION FAILED ===")
        print(f"Error: {exc}")


if __name__ == "__main__":
    run_pipeline()
