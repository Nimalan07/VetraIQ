from typing import Any, Dict

from pydantic import ValidationError

from app.models.schema import (
    CoreFields,
    TechnicalAttributes,
)


def validate_extraction_structure(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Validate the structure returned by the LLM.

    This validates the AI output structure,
    not business rules such as duplicate SKUs.
    """

    core_fields = data.get(
        "core_fields",
        {},
    )

    technical_attributes = data.get(
        "technical_attributes",
        {},
    )

    validated_core = CoreFields.model_validate(
        core_fields
    )

    validated_technical = (
        TechnicalAttributes.model_validate(
            technical_attributes
        )
    )

    return {
        "core_fields": validated_core.model_dump(),
        "technical_attributes": (
            validated_technical.model_dump()
        ),
    }
