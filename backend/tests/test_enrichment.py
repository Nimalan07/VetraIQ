from unittest.mock import patch

from app.pipeline.enrichment import (
    enrich_missing,
)


def test_enrichment():

    product = {
        "core_fields": {
            "product_name": {
                "value": "Test Valve"
            },
            "brand_manufacturer": {
                "value": "Test Brand"
            },
            "category": {
                "value": "Ball Valve"
            },
            "sku_part_number": {
                "value": "VAL-100"
            },
        },
        "technical_attributes": {
            "material": {
                "value": None
            },
            "dimensions": {
                "value": None
            },
            "weight": {
                "value": None
            },
            "voltage_power_rating": {
                "value": None
            },
        },
    }

    mock_result = {
        "value": "Stainless Steel",
        "confidence": 0.91,
        "method": "enriched",
        "source_ref": (
            "https://example.com/product"
        ),
        "flags": [],
    }

    with patch(
        "app.pipeline.enrichment.enrich_field",
        return_value=mock_result,
    ):

        result = enrich_missing(
            product
        )

    assert (
        result[
            "technical_attributes"
        ]["material"]["value"]
        == "Stainless Steel"
    )
