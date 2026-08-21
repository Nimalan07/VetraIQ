import json
import logging
from typing import Any, Dict, List

from app.services.llm_client import call_llm
from app.services.search_client import (
    fetch_page_text,
    search_web,
)

logger = logging.getLogger(__name__)


MAX_ENRICHMENT_FIELDS = 3


def get_field_value(
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


def find_missing_fields(
    product: Dict[str, Any],
) -> List[str]:
    """
    Find important missing fields that may
    be candidates for web enrichment.
    """

    missing = []

    core = product.get(
        "core_fields",
        {},
    )

    technical = product.get(
        "technical_attributes",
        {},
    )

    important_core_fields = [
        "brand_manufacturer",
        "sku_part_number",
        "description",
    ]

    for field in important_core_fields:

        value = core.get(
            field,
            {},
        ).get("value")

        if value is None or value == "":
            missing.append(field)

    important_technical_fields = [
        "material",
        "dimensions",
        "weight",
        "voltage_power_rating",
    ]

    for field in important_technical_fields:

        value = technical.get(
            field,
            {},
        ).get("value")

        if value is None or value == "":
            missing.append(field)

    return missing


def build_search_query(
    product: Dict[str, Any],
    field: str,
) -> str:

    core = product.get(
        "core_fields",
        {},
    )

    product_name = (
        core
        .get("product_name", {})
        .get("value", "")
    )

    manufacturer = (
        core
        .get("brand_manufacturer", {})
        .get("value", "")
    )

    category = (
        core
        .get("category", {})
        .get("value", "")
    )

    # Human-friendly search terms
    field_terms = {
        "sku_part_number": "part number",
        "description": "product description",
        "material": "material",
        "dimensions": "dimensions size",
        "weight": "weight",
        "voltage_power_rating": "pressure rating specification",
        "certifications_compliance": "certification standard",
        "compatible_parts": "compatible parts",
    }

    search_field = field_terms.get(
        field,
        field.replace("_", " "),
    )

    identity = " ".join(
        str(value)
        for value in [
            manufacturer,
            product_name,
            category,
        ]
        if value
    )

    return (
        f'"{identity}" '
        f'{search_field}'
    ).strip()


def build_enrichment_prompt(
    product: Dict[str, Any],
    field: str,
    evidence: str,
) -> str:

    return f"""
You are verifying one missing field
for an industrial product.

PRODUCT:

{product}

FIELD TO FIND:

{field}

EVIDENCE FROM WEB SOURCE:

{evidence}

RULES:

1. Extract the value ONLY if the evidence supports it.
2. Do not guess.
3. If the evidence does not contain the value,
   return null.
4. Preserve units.
5. Confidence must be between 0 and 1.
6. Method must be "enriched".
7. Return JSON only.

OUTPUT:

{{
    "value": null,
    "confidence": 0.0,
    "method": "enriched",
    "flags": []
}}
"""


def enrich_field(
    product: Dict[str, Any],
    field: str,
) -> Dict[str, Any]:

    query = build_search_query(
        product,
        field,
    )

    logger.info(
        "Enriching field '%s' using query: %s",
        field,
        query,
    )

    results = search_web(
        query,
        max_results=2,
    )

    if not results:

        return {
            "value": None,
            "confidence": 0.0,
            "method": None,
            "source_ref": None,
            "flags": [
                "no_search_results"
            ],
        }

    for result in results:

        url = result.get("url")
        snippet = result.get(
            "snippet",
            "",
        )

        page_text = fetch_page_text(
            url
        )

        evidence = page_text or snippet

        if not evidence:
            continue

        prompt = build_enrichment_prompt(
            product,
            field,
            evidence[:3000],
        )

        try:

            raw = call_llm(
                prompt
            )

            extracted = json.loads(
                raw
            )

            value = extracted.get(
                "value"
            )

            if value is not None:

                return {
                    "value": value,
                    "confidence": float(
                        extracted.get(
                            "confidence",
                            0.0,
                        )
                    ),
                    "method": "enriched",
                    "source_ref": url,
                    "flags": extracted.get(
                        "flags",
                        [],
                    ),
                }

        except Exception as exc:

            logger.warning(
                "Enrichment failed for %s: %s",
                field,
                exc,
            )

    return {
        "value": None,
        "confidence": 0.0,
        "method": None,
        "source_ref": None,
        "flags": [
            "enrichment_unsuccessful"
        ],
    }


def enrich_missing(
    product: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Enrich only a small number of missing fields.

    This prevents excessive web requests and
    unnecessary LLM calls.
    """

    missing_fields = find_missing_fields(
        product
    )

    fields_to_enrich = (
        missing_fields[
            :MAX_ENRICHMENT_FIELDS
        ]
    )

    for field in fields_to_enrich:

        enriched_value = enrich_field(
            product,
            field,
        )

        if field in product.get(
            "core_fields",
            {},
        ):

            product[
                "core_fields"
            ][field] = enriched_value

        elif field in product.get(
            "technical_attributes",
            {},
        ):

            product[
                "technical_attributes"
            ][field] = enriched_value

    return product
