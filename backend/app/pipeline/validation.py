import re
from typing import Any, Dict, List


REQUIRED_FIELDS = [
    "product_name",
    "sku_part_number",
    "category",
]


def get_value(
    product: Dict[str, Any],
    section: str,
    field: str,
):
    return (
        product
        .get(section, {})
        .get(field, {})
        .get("value")
    )


def validate_required_fields(
    product: Dict[str, Any],
) -> List[str]:

    missing = []

    for field in REQUIRED_FIELDS:

        value = get_value(
            product,
            "core_fields",
            field,
        )

        if value is None or str(
            value
        ).strip() == "":

            missing.append(field)

    return missing


def validate_confidence(
    product: Dict[str, Any],
) -> List[str]:

    flags = []

    sections = [
        "core_fields",
        "technical_attributes",
    ]

    for section in sections:

        fields = product.get(
            section,
            {},
        )

        for field_name, field_data in fields.items():

            if field_name == "custom_attributes":
                continue

            if not isinstance(
                field_data,
                dict,
            ):
                continue

            confidence = field_data.get(
                "confidence"
            )

            if confidence is None:
                continue

            if not (
                0.0
                <= float(confidence)
                <= 1.0
            ):

                flags.append(
                    f"{field_name}:invalid_confidence"
                )

    return flags


def validate_units(
    product: Dict[str, Any],
) -> List[str]:

    flags = []

    technical = product.get(
        "technical_attributes",
        {},
    )

    dimensions = technical.get(
        "dimensions",
        {},
    ).get(
        "value"
    )

    weight = technical.get(
        "weight",
        {},
    ).get(
        "value"
    )

    voltage = technical.get(
        "voltage_power_rating",
        {},
    ).get(
        "value"
    )

    if dimensions:

        text = str(
            dimensions
        ).lower()

        if not re.search(
            r"(mm|cm|m|in|inch|ft)",
            text,
        ):

            flags.append(
                "dimensions_missing_recognized_unit"
            )

    if weight:

        text = str(
            weight
        ).lower()

        if not re.search(
            r"(mg|g|kg|lb|lbs)",
            text,
        ):

            flags.append(
                "weight_missing_recognized_unit"
            )

    if voltage:

        text = str(
            voltage
        ).lower()

        if not re.search(
            r"(v|kv|mv|w|kw|mw|hp)",
            text,
        ):

            flags.append(
                "rating_missing_recognized_unit"
            )

    return flags


def validate_product(
    product: Dict[str, Any],
) -> Dict[str, Any]:

    missing_fields = (
        validate_required_fields(
            product
        )
    )

    confidence_flags = (
        validate_confidence(
            product
        )
    )

    unit_flags = (
        validate_units(
            product
        )
    )

    all_flags = (
        confidence_flags
        + unit_flags
    )

    if missing_fields:
        all_flags.append(
            "required_fields_missing"
        )

    return {
        "missing_required_fields": (
            missing_fields
        ),
        "unit_inconsistencies": (
            unit_flags
        ),
        "duplicate_of": None,
        "flags": all_flags,
    }
