from app.pipeline.consistency import (
    find_duplicate_products,
)


def test_duplicate_sku():

    products = [

        {
            "product_id": "1",
            "core_fields": {
                "sku_part_number": {
                    "value": "ABC-100"
                }
            },
        },

        {
            "product_id": "2",
            "core_fields": {
                "sku_part_number": {
                    "value": "ABC-100"
                }
            },
        },
    ]

    duplicates = (
        find_duplicate_products(
            products
        )
    )

    assert len(
        duplicates
    ) == 1

    assert (
        duplicates[0][
            "duplicate_of"
        ] == "1"
    )
