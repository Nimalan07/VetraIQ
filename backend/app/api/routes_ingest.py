import logging
import shutil
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
    Depends,
)
from sqlalchemy.orm import Session

from app.pipeline.ingestion import ingest_pdf
from app.pipeline.normalization import normalize_text
from app.services.db import get_db
from app.models.db_models import Product


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ingest",
    tags=["Ingestion"],
)


BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload and ingest a PDF product specification sheet.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided.",
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    unique_name = (
        f"{uuid.uuid4()}_{file.filename}"
    )

    destination = (
        UPLOAD_DIR / unique_name
    )

    try:

        with destination.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

        result = ingest_pdf(
            str(destination)
        )

        normalized_text = normalize_text(
            result["text"]
        )

        result["text"] = normalized_text

        # Persist the ingestion stage record to SQLite database
        db_product = Product(
            id=result["product_id"],
            source_type="pdf",
            source_reference=unique_name,
            raw_text=normalized_text,
            status="ingested",
        )
        db.add(db_product)
        db.commit()

        return {
            "success": True,
            "message": "PDF ingested successfully.",
            "data": {
                "product_id": result["product_id"],
                "filename": unique_name,
                "source_type": result["source_type"],
                "source_reference": result[
                    "source_reference"
                ],
                "text_length": len(
                    normalized_text
                ),
                "preview": normalized_text[:1000],
            },
        }

    except ValueError as exc:

        logger.exception(
            "PDF ingestion failed."
        )

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        logger.exception(
            "Unexpected PDF ingestion error."
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to process PDF.",
        )
