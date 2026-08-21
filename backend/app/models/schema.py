from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ProductField(BaseModel):
    """
    Explainable representation of one product field.

    Every extracted field carries:
    - value
    - confidence
    - method
    - source reference
    - validation flags
    """

    value: Any = None

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
    )

    method: Optional[str] = None

    source_ref: Optional[str] = None

    flags: List[str] = Field(
        default_factory=list
    )


class CoreFields(BaseModel):

    product_name: ProductField = Field(
        default_factory=ProductField
    )

    brand_manufacturer: ProductField = Field(
        default_factory=ProductField
    )

    category: ProductField = Field(
        default_factory=ProductField
    )

    sku_part_number: ProductField = Field(
        default_factory=ProductField
    )

    description: ProductField = Field(
        default_factory=ProductField
    )

    price: ProductField = Field(
        default_factory=ProductField
    )


class TechnicalAttributes(BaseModel):

    material: ProductField = Field(
        default_factory=ProductField
    )

    dimensions: ProductField = Field(
        default_factory=ProductField
    )

    weight: ProductField = Field(
        default_factory=ProductField
    )

    voltage_power_rating: ProductField = Field(
        default_factory=ProductField
    )

    certifications_compliance: ProductField = Field(
        default_factory=ProductField
    )

    compatible_parts: ProductField = Field(
        default_factory=ProductField
    )

    custom_attributes: Dict[str, ProductField] = Field(
        default_factory=dict
    )


class ValidationResult(BaseModel):

    missing_required_fields: List[str] = Field(
        default_factory=list
    )

    unit_inconsistencies: List[str] = Field(
        default_factory=list
    )

    duplicate_of: Optional[str] = None

    flags: List[str] = Field(
        default_factory=list
    )


class ProductSchema(BaseModel):

    product_id: str

    source_type: str

    source_reference: str

    core_fields: CoreFields = Field(
        default_factory=CoreFields
    )

    technical_attributes: TechnicalAttributes = Field(
        default_factory=TechnicalAttributes
    )

    validation: ValidationResult = Field(
        default_factory=ValidationResult
    )

    review_status: str = "pending"
