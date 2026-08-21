from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    String,
    Text,
)

from app.services.db import Base


class Product(Base):
    """
    Stores an ingested product.
    """

    __tablename__ = "products"

    id = Column(
        String,
        primary_key=True,
        index=True,
    )

    source_type = Column(
        String,
        nullable=False,
    )

    source_reference = Column(
        String,
        nullable=False,
    )

    raw_text = Column(
        Text,
        nullable=True,
    )

    extraction_json = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        default="ingested",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
