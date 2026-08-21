import json
import logging
from typing import Dict, Any

from app.services.llm_client import call_llm


logger = logging.getLogger(__name__)


EXTRACTION_PROMPT = """
You are an industrial product data extraction engine.

Your task is to extract structured product information
from an industrial specification document.

IMPORTANT RULES:

1. Extract only information supported by the document.
2. Never invent values.
3. If a value is not available, use null.
4. Identify the product category before extracting
   category-specific specifications.
5. Preserve the original technical meaning.
6. Do not confuse model numbers with generic product names.
7. Include the page number in source_ref whenever possible.
8. Confidence must reflect true extraction certainty:
   - 0.99 for name or brand_manufacturer clearly stated on the page.
   - 0.95 for material, certifications, or standard parameters.
   - 0.85 for complex attributes inferred from context or tables.
   - 0.00 for missing/empty fields (null values).
9. Do not use external knowledge.
10. Category-specific fields should go inside custom_attributes.
11. Return ONLY valid JSON.
12. Every extracted field must contain:
       value
       confidence
       method
       source_ref
       flags

METHOD RULE:

Use:
"extracted"
when the value is explicitly present in the document.

Do NOT use:
"inferred"
unless the document itself clearly supports the inference.

SOURCE FORMAT:

Use:

"document:pN"

where N is the page number.

Example:

"motor_catalog.pdf:p12"

OUTPUT STRUCTURE:

{
  "core_fields": {
    "product_name": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "brand_manufacturer": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "category": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "sku_part_number": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "description": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "price": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    }
  },

  "technical_attributes": {
    "material": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "dimensions": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "weight": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "voltage_power_rating": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "certifications_compliance": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },
    "compatible_parts": {
      "value": null,
      "confidence": 0.0,
      "method": null,
      "source_ref": null,
      "flags": []
    },

    "custom_attributes": {}
  }
}

DOCUMENT:

{text}
"""


def build_extraction_prompt(
    text: str,
) -> str:
    """
    Build the final extraction prompt.

    The text is limited to avoid sending unnecessarily
    huge documents to the model.
    """

    max_chars = 5000

    truncated_text = text[:max_chars]

    return EXTRACTION_PROMPT.replace(
        "{text}",
        truncated_text
    )


def extract_product(
    text: str,
) -> Dict[str, Any]:
    """
    Extract and structurally validate a product.
    """

    if not text.strip():
        raise ValueError(
            "Cannot extract product from empty text."
        )

    prompt = build_extraction_prompt(
        text
    )

    logger.info(
        "Starting AI product extraction."
    )

    raw_response = call_llm(
        prompt
    )

    try:
        data = json.loads(
            raw_response
        )

        # Defensive normalization: Ensure all custom_attributes match Dict[str, ProductField]
        if isinstance(data, dict):
            tech_attrs = data.get("technical_attributes", {})
            if isinstance(tech_attrs, dict):
                custom_attrs = tech_attrs.get("custom_attributes", {})
                if isinstance(custom_attrs, dict):
                    normalized_custom = {}
                    for key, val in custom_attrs.items():
                        if isinstance(val, dict) and "value" in val:
                            normalized_custom[key] = val
                        else:
                            normalized_custom[key] = {
                                "value": val,
                                "confidence": 0.9,
                                "method": "extracted",
                                "source_ref": "document:p1",
                                "flags": []
                            }
                    tech_attrs["custom_attributes"] = normalized_custom

    except json.JSONDecodeError as exc:

        logger.error(
            "Invalid JSON returned by Groq: %s",
            raw_response,
        )

        raise ValueError(
            f"LLM returned invalid JSON: {raw_response[:500]}"
        ) from exc

    from app.pipeline.schema_validation import (
        validate_extraction_structure,
    )

    validated_data = (
        validate_extraction_structure(
            data
        )
    )

    logger.info(
        "AI extraction successfully validated."
    )

    return validated_data
