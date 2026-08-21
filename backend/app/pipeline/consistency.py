from typing import Any, Dict, List


def normalize_identifier(
    value: Any,
) -> str:

    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .lower()
        .replace(" ", "")
        .replace("-", "")
        .replace("_", "")
    )


def get_sku(
    product: Dict[str, Any],
) -> str:

    return (
        product
        .get("core_fields", {})
        .get("sku_part_number", {})
        .get("value")
        or ""
    )


def find_duplicate_products(
    products: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:

    seen = {}

    duplicates = []

    for product in products:

        sku = normalize_identifier(
            get_sku(product)
        )

        if not sku:
            continue

        product_id = product.get(
            "product_id"
        )

        if sku in seen:

            duplicates.append(
                {
                    "product_id": product_id,
                    "duplicate_of": seen[sku],
                    "sku": sku,
                }
            )

        else:

            seen[sku] = product_id

    return duplicates


def compare_product_fields(
    product_a: Dict[str, Any],
    product_b: Dict[str, Any],
) -> List[str]:

    conflicts = []

    fields = [
        (
            "core_fields",
            "brand_manufacturer",
        ),
        (
            "core_fields",
            "category",
        ),
        (
            "technical_attributes",
            "material",
        ),
        (
            "technical_attributes",
            "dimensions",
        ),
        (
            "technical_attributes",
            "weight",
        ),
        (
            "technical_attributes",
            "voltage_power_rating",
        ),
    ]

    for section, field in fields:

        value_a = (
            product_a
            .get(section, {})
            .get(field, {})
            .get("value")
        )

        value_b = (
            product_b
            .get(section, {})
            .get(field, {})
            .get("value")
        )

        if (
            value_a is not None
            and value_b is not None
            and str(value_a).strip().lower()
            != str(value_b).strip().lower()
        ):

            conflicts.append(
                f"{field}: "
                f"'{value_a}' vs '{value_b}'"
            )

    return conflicts
