from app.pipeline.validation import (
    validate_product,
)


def test_missing_required_fields():

    product = {
        "core_fields": {
            "product_name": {
                "value": "Test Product"
            },
            "sku_part_number": {
                "value": None
            },
            "category": {
                "value": "Valve"
            },
        },
        "technical_attributes": {},
    }

    result = validate_product(
        product
    )

    assert (
        "sku_part_number"
        in result[
            "missing_required_fields"
        ]
    )
