import logging
import re
import json
from pathlib import Path
import pandas as pd

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
            
    # Absolute fallback of the first 60 core columns and main layouts if file is missing
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
    # Regex to capture decimal/fractional numbers followed by alphabet/special units
    match = re.match(r"^([\d\.,\-\/]+)\s*([a-zA-Z\-\/%\*°]+)$", val_str)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    return val_str, ""

def find_flexible_value(row: dict, keys: list, default: str = "") -> str:
    row_lower = {}
    for k, v in row.items():
        k_clean = str(k).lower().replace("_", "").replace(" ", "").strip()
        row_lower[k_clean] = v
    for key in keys:
        key_clean = str(key).lower().replace("_", "").replace(" ", "").strip()
        if key_clean in row_lower:
            val = row_lower[key_clean]
            if val is not None and str(val).lower() not in ("nan", "none", "null", "<na>"):
                return str(val).strip()
    return default


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

    # Map raw input columns directly if available
    raw = raw_input_row or {}
    
    mfg_part_num = find_flexible_value(raw, ["Mfg_Part_Num", "PART_NUMBER", "SKU", "Part_Number", "Part_Num", "partno"]) or norm_prod.get("sku") or ""
    part_desc = find_flexible_value(raw, ["Part_Desc", "Description", "Part_Description", "Desc"]) or norm_prod.get("description") or ""
    part_manuf = find_flexible_value(raw, ["Part_Manuf", "Manufacturer", "Part_Manufacturer", "Manuf", "Brand", "Brand_Name"]) or norm_prod.get("manufacturer") or ""

    row["Mfg_Part_Num"] = mfg_part_num
    row["Part_Desc"] = part_desc
    row["E1_Brand"] = find_flexible_value(raw, ["E1_Brand", "E1Brand", "E1 Brand"], "-- Unbranded --")
    row["Unilog_Brand"] = find_flexible_value(raw, ["Unilog_Brand", "UnilogBrand", "Unilog Brand"], "-- No Unilog Brand --")
    row["DIB_Brand"] = find_flexible_value(raw, ["DIB_Brand", "DIBBrand", "DIB Brand"], "-- No DIB Brand --")
    row["Part_Manuf"] = part_manuf

    # Core Identifiers
    row["PART_NUMBER"] = norm_prod.get("sku") or mfg_part_num
    row["SKU - MY_PART_NUMBER"] = norm_prod.get("sku") or mfg_part_num
    row["MANUFACTURER_NAME"] = norm_prod.get("manufacturer") or part_manuf
    row["BRAND_NAME"] = norm_prod.get("manufacturer") or part_manuf
    row["Product Name"] = norm_prod.get("productName") or part_desc

    # Descriptions
    desc = norm_prod.get("description") or part_desc
    row["SHORT_DESC"] = desc[:100] if desc else ""
    row["MOBILE_DESC"] = desc[:250] if desc else ""
    row["INVOICE_DESC"] = desc[:100] if desc else ""
    row["LONG_DESC1"] = desc
    row["RETAIL_DESC"] = desc
    row["MARKETING_DESCRIPTION"] = desc

    # Categories
    cat = norm_prod.get("category") or ""
    row["Class"] = cat
    row["Fine"] = cat
    row["Classpath"] = f"Industrial Products > {cat}" if cat else "Industrial Products"

    # Gathers attributes to map to Attribute columns
    attributes_to_map = []

    # Helper to add spec
    def add_spec(label: str, val):
        if val and str(val).lower() not in ("not available", "none", "null"):
            val_clean = val.get("value") if isinstance(val, dict) else val
            if val_clean:
                attributes_to_map.append((label, str(val_clean)))

    add_spec("Material", norm_prod.get("material"))
    add_spec("Dimensions", norm_prod.get("dimensions"))
    add_spec("Weight", norm_prod.get("weight"))
    add_spec("Voltage / Power Rating", norm_prod.get("voltagePowerRating"))
    add_spec("Certifications / Compliance", norm_prod.get("certifications"))
    add_spec("Compatible Parts", norm_prod.get("compatibleParts"))

    # Add custom dynamic parameters
    custom_attrs = norm_prod.get("customAttributes", {})
    if isinstance(custom_attrs, dict):
        for key, attr_obj in custom_attrs.items():
            label = key.replace("_", " ").title()
            val_val = attr_obj.get("value") if isinstance(attr_obj, dict) else attr_obj
            add_spec(label, val_val)

    # Populate ATTRIBUTE_LABEL, ATTRIBUTE_VALUE, ATTRIBUTE_UOM (1 to 50)
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

    # Other metadata fallback
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
    # Ensure correct column order & shape
    df = df[official_columns]
    return df.to_csv(index=False)
