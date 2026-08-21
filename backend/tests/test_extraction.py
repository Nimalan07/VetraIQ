from unittest.mock import patch

from app.pipeline.extraction import (
    extract_product,
)


MOCK_RESPONSE = """
{
  "core_fields": {
    "product_name": {
      "value": "Test Motor",
      "confidence": 0.95,
      "method": "extracted",
      "source_ref": "test.pdf:p1",
      "flags": []
    },
    "brand_manufacturer": {
      "value": "Test Manufacturer",
      "confidence": 0.95,
      "method": "extracted",
      "source_ref": "test.pdf:p1",
      "flags": []
    },
    "category": {
      "value": "Electric Motor",
      "confidence": 0.95,
      "method": "extracted",
      "source_ref": "test.pdf:p1",
      "flags": []
    },
    "sku_part_number": {
      "value": "TEST-001",
      "confidence": 0.90,
      "method": "extracted",
      "source_ref": "test.pdf:p1",
      "flags": []
    },
    "description": {
      "value": "Test product",
      "confidence": 0.90,
      "method": "extracted",
      "source_ref": "test.pdf:p1",
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
      "value": "415 V",
      "confidence": 0.96,
      "method": "extracted",
      "source_ref": "test.pdf:p2",
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
    "custom_attributes": {
      "frequency": {
        "value": "50 Hz",
        "confidence": 0.92,
        "method": "extracted",
        "source_ref": "test.pdf:p2",
        "flags": []
      }
    }
  }
}
"""


@patch(
    "app.pipeline.extraction.call_llm"
)
def test_extract_product(
    mock_llm,
):

    mock_llm.return_value = (
        MOCK_RESPONSE
    )

    result = extract_product(
        "Test industrial motor document."
    )

    assert (
        result["core_fields"]
        ["product_name"]
        ["value"]
        == "Test Motor"
    )

    assert (
        result["core_fields"]
        ["category"]
        ["value"]
        == "Electric Motor"
    )

    assert (
        result["technical_attributes"]
        ["voltage_power_rating"]
        ["value"]
        == "415 V"
    )

    assert (
        result["technical_attributes"]
        ["custom_attributes"]
        ["frequency"]
        ["value"]
        == "50 Hz"
    )
