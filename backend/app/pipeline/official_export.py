import logging
import re
from pathlib import Path
import pandas as pd

from app.pipeline.cleaner import clean_placeholder
from app.pipeline.manufacturer_resolver import resolve_manufacturer_and_brand
from app.pipeline.uom_normalizer import normalize_value_and_uom, decimal_to_fraction
from app.pipeline.lov_engine import resolve_lov_value
from app.pipeline.desc_generator import (
    generate_invoice_desc,
    generate_mobile_desc,
    generate_short_desc,
    generate_long_desc,
)

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
TEMPLATE_PATH = BASE_DIR / "datasets" / "Unihack Expected Output - Delivery Format.csv"

def get_official_columns() -> list:
    """
    Read the official column headers from the template CSV.
    """
    if TEMPLATE_PATH.exists():
        try:
            df = pd.read_csv(TEMPLATE_PATH, nrows=1)
            return df.columns.tolist()
        except Exception as exc:
            logger.error("Failed to read official columns from template: %s", exc)
            
    return []

def parse_val_uom(val_str: str) -> tuple:
    """
    Parse a technical spec string into (value, unit of measure).
    Example: "120 V" -> ("120", "V")
             "2.5 kg" -> ("2.5", "kg")
    """
    if not val_str or str(val_str).lower() in ("not available", "none", "null"):
        return "", ""
    
    val_str = str(val_str).strip()
    match = re.match(r"^([\d\.,\-\/]+)\s*([a-zA-Z\-\/%\*°]+)$", val_str)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    return val_str, ""

def create_unihack_row(norm_prod: dict, raw_input_row: dict = None, official_columns: list = None) -> dict:
    """
    Map an internal normalized product dictionary (and optional raw CSV row)
    to a single row matching the 252 official columns.
    """
    if not official_columns:
        official_columns = get_official_columns()
        
    if not official_columns:
        logger.error("No official columns list available. Return empty mapping.")
        return {}

    # Initialize empty row
    row = {col: "" for col in official_columns}

    raw = raw_input_row or {}
    
    # Clean inputs and resolve manufacturer & brand canonical values
    raw_manuf = raw.get("Part_Manuf", norm_prod.get("manufacturer") or "")
    raw_pn = raw.get("Mfg_Part_Num", norm_prod.get("sku") or "")
    raw_desc = raw.get("Part_Desc", norm_prod.get("description") or "")
    
    mfg, brand = resolve_manufacturer_and_brand(raw_manuf, raw_pn, raw_desc)
    
    row["Mfg_Part_Num"] = clean_placeholder(raw_pn)
    row["Part_Desc"] = clean_placeholder(raw_desc)
    row["E1_Brand"] = brand if brand else "-- Unbranded --"
    row["Unilog_Brand"] = brand if brand else "-- No Unilog Brand --"
    row["DIB_Brand"] = brand if brand else "-- No DIB Brand --"
    row["Part_Manuf"] = mfg

    # Core Identifiers
    row["PART_NUMBER"] = clean_placeholder(norm_prod.get("sku") or raw_pn)
    row["SKU - MY_PART_NUMBER"] = clean_placeholder(norm_prod.get("sku") or raw_pn)
    row["MANUFACTURER_NAME"] = mfg
    row["BRAND_NAME"] = brand
    
    prod_title = clean_placeholder(norm_prod.get("productName") or raw_desc)
    row["Product Name"] = prod_title

    # Categories
    cat = clean_placeholder(norm_prod.get("category") or "")
    row["Class"] = cat
    row["Fine"] = cat
    row["Classpath"] = f"Industrial Products > {cat}" if cat else "Industrial Products"

    # Gather & normalize specifications
    attributes_to_map = []

    def add_spec(label: str, val):
        if val and str(val).lower() not in ("not available", "none", "null"):
            val_clean = val.get("value") if isinstance(val, dict) else val
            if val_clean:
                val_clean = clean_placeholder(val_clean)
                if val_clean:
                    # 1. Normalize decimals, UOM, and spacing
                    val_norm = normalize_value_and_uom(val_clean)
                    # 2. Check allowed LOV vocabulary
                    val_lov = resolve_lov_value(label, val_norm)
                    if val_lov:
                        attributes_to_map.append((label, val_lov))

    add_spec("Material", norm_prod.get("material"))
    add_spec("Dimensions", norm_prod.get("dimensions"))
    add_spec("Weight", norm_prod.get("weight"))
    add_spec("Voltage / Power Rating", norm_prod.get("voltagePowerRating"))
    add_spec("Certifications / Compliance", norm_prod.get("certifications"))
    add_spec("Compatible Parts", norm_prod.get("compatibleParts"))

    # Add custom attributes
    custom_attrs = norm_prod.get("customAttributes", {})
    if isinstance(custom_attrs, dict):
        for key, attr_obj in custom_attrs.items():
            label = key.replace("_", " ").title()
            val_val = attr_obj.get("value") if isinstance(attr_obj, dict) else attr_obj
            add_spec(label, val_val)

    # Generate copywriting descriptions based on constraints
    specs_for_desc = [(lbl, val) for lbl, val in attributes_to_map]
    
    invoice_desc = generate_invoice_desc(mfg, cat, specs_for_desc)
    mobile_desc = generate_mobile_desc(brand, prod_title, cat, specs_for_desc)
    short_desc = generate_short_desc(prod_title, specs_for_desc)
    long_desc = generate_long_desc(brand, prod_title, cat, specs_for_desc)
    
    row["INVOICE_DESC"] = invoice_desc
    row["MOBILE_DESC"] = mobile_desc
    row["SHORT_DESC"] = short_desc
    row["LONG_DESC1"] = long_desc
    row["RETAIL_DESC"] = long_desc
    row["MARKETING_DESCRIPTION"] = long_desc

    # Map attributes 1 to 50
    for idx, (label, raw_val) in enumerate(attributes_to_map[:50]):
        col_num = idx + 1
        label_col = f"ATTRIBUTE_LABEL {col_num}"
        val_col = f"ATTRIBUTE_VALUE {col_num}"
        uom_col = f"ATTRIBUTE_UOM {col_num}"

        val, uom = parse_val_uom(raw_val)

        if label_col in row:
            row[label_col] = label
        if val_col in row:
            row[val_col] = val
        if uom_col in row:
            row[uom_col] = uom

    row["Actual Image (Yes/No)"] = "No"

    return row

def generate_unihack_csv(normalized_products: list, raw_rows: list = None) -> str:
    """
    Takes a list of normalized products and raw inputs, converts them
    to a pandas DataFrame matching the official columns, and returns CSV string.
    """
    official_columns = get_official_columns()
    if not official_columns:
        logger.error("Cannot generate CSV because official template headers are missing.")
        raise ValueError("Official template headers are missing.")

    rows = []
    for idx, prod in enumerate(normalized_products):
        raw_row = raw_rows[idx] if (raw_rows and idx < len(raw_rows)) else None
        rows.append(create_unihack_row(prod, raw_row, official_columns))

    df = pd.DataFrame(rows)
    df = df[official_columns]
    return df.to_csv(index=False)
