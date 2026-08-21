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

    # Map other fields from customAttributes or raw
    def map_field(col_name: str, key_in_custom: str, fallback_raw_key: str = None):
        if col_name in row:
            val = custom_attrs.get(key_in_custom)
            if val:
                val_val = val.get("value") if isinstance(val, dict) else val
                row[col_name] = clean_placeholder(val_val)
            elif fallback_raw_key and fallback_raw_key in raw:
                row[col_name] = clean_placeholder(raw[fallback_raw_key])

    map_field("MFR URL", "mfr_url", "MFR URL")
    map_field("Ref URL 1", "ref_url_1", "Ref URL 1")
    map_field("Ref URL 2", "ref_url_2", "Ref URL 2")
    map_field("Ref URL 3", "ref_url_3", "Ref URL 3")
    map_field("Ref URL 4", "ref_url_4", "Ref URL 4")
    map_field("Ref URL 5", "ref_url_5", "Ref URL 5")
    map_field("UPC", "upc", "UPC")
    map_field("EAN", "ean", "EAN")
    map_field("GTIN", "gtin", "GTIN")
    map_field("UNSPSC", "unspsc", "UNSPSC")
    map_field("Warranty", "warranty", "Warranty")
    map_field("List Price", "list_price", "List Price")
    map_field("Selling Qty", "selling_qty", "Selling Qty")
    map_field("Selling UOM", "selling_uom", "Selling UOM")
    map_field("Standard Packaging Information", "standard_packaging_information", "Standard Packaging Information")
    map_field("LENGTH", "length", "LENGTH")
    map_field("LENGTH_UOM", "length_uom", "LENGTH_UOM")
    map_field("HEIGHT", "height", "HEIGHT")
    map_field("HEIGHT_UOM", "height_uom", "HEIGHT_UOM")
    map_field("WIDTH", "width", "WIDTH")
    map_field("WIDTH_UOM", "width_uom", "WIDTH_UOM")
    map_field("VOLUME", "volume", "VOLUME")
    map_field("VOLUME_UOM", "volume_uom", "VOLUME_UOM")
    map_field("Product Image", "product_image", "Product Image")
    map_field("Alternate Image 1", "alternate_image_1", "Alternate Image 1")
    map_field("Alternate Image 2", "alternate_image_2", "Alternate Image 2")
    map_field("Alternate Image 3", "alternate_image_3", "Alternate Image 3")
    map_field("Alternate Image 4", "alternate_image_4", "Alternate Image 4")
    map_field("SDS", "sds", "SDS")
    map_field("SDS_1", "sds_1", "SDS_1")
    map_field("Warranty Information", "warranty_information", "Warranty Information")
    map_field("Catalog", "catalog", "Catalog")
    map_field("Specification Sheet", "specification_sheet", "Specification Sheet")
    map_field("Instruction/Installation Manual", "instruction_installation_manual", "Instruction/Installation Manual")
    map_field("Service Manual", "service_manual", "Service Manual")
    map_field("Owners/User Manual", "owners_user_manual", "Owners/User Manual")
    map_field("Line Drawing", "line_drawing", "Line Drawing")
    map_field("MTR", "mtr", "MTR")
    map_field("RoHS", "rohs", "RoHS")
    map_field("Full Engineering Drawing", "full_engineering_drawing", "Full Engineering Drawing")
    map_field("Energy Star Guide", "energy_star_guide", "Energy Star Guide")
    map_field("Technical Bulletin", "technical_bulletin", "Technical Bulletin")
    map_field("Submittal", "submittal", "Submittal")
    map_field("Compatibility Chart", "compatibility_chart", "Compatibility Chart")
    map_field("Size Chart", "size_chart", "Size Chart")
    map_field("Product Label/Insert", "product_label_insert", "Product Label/Insert")
    map_field("Video Link", "video_link", "Video Link")
    map_field("Video Link 1", "video_link_1", "Video Link 1")
    map_field("Country Of Origin", "country_of_origin", "Country Of Origin")
    map_field("Discontinued", "discontinued", "Discontinued")
    map_field("With", "with", "With")
    map_field("Standard/Approvals", "standard_approvals", "Standard/Approvals")
    map_field("Prop 65", "prop_65", "Prop 65")
    map_field("Application", "application", "Application")
    map_field("Includes", "includes", "Includes")

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
