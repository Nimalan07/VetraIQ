import pandas as pd
from app.pipeline.cleaner import clean_placeholder, normalize_text_spaces
from app.pipeline.manufacturer_resolver import resolve_manufacturer_and_brand
from app.pipeline.uom_normalizer import decimal_to_fraction, normalize_value_and_uom
from app.pipeline.lov_engine import resolve_lov_value
from app.pipeline.evaluate import run_evaluation

def test_clean_placeholder():
    assert clean_placeholder("-- Unbranded --") == ""
    assert clean_placeholder("none") == ""
    assert clean_placeholder("3M") == "3M"

def test_resolve_manufacturer_and_brand():
    mfg, brand = resolve_manufacturer_and_brand("Jam Industrial Supply LLC (JAMIN)", "3MABR-7100075678", "3M 775L Stikit Film P150")
    assert mfg == "3M"
    assert brand == "3M"
    
    mfg, brand = resolve_manufacturer_and_brand("Freud Inc (2435)", "DCB518ASTS06G", "Diablo Sanding Belt")
    assert mfg == "Freud Inc"
    assert brand == "Freud Inc"

def test_uom_normalization():
    assert decimal_to_fraction(0.5) == "1/2"
    assert decimal_to_fraction(24.25) == "24-1/4"
    
    assert normalize_value_and_uom("24.5 inch") == "24-1/2 in"
    assert normalize_value_and_uom("120V") == "120 V"

def test_lov_validation():
    assert resolve_lov_value("Material", "silicon carbide") == "Silicon Carbide"
    assert resolve_lov_value("Compatible Parts", "belt sander") == "Belt Sander"

def test_evaluate_engine():
    target_data = {
        "PART_NUMBER": ["PDSH4816AF"],
        "Mfg_Part_Num": ["PDSH4816AF"],
        "MANUFACTURER_NAME": ["Rheem Manufacturing"],
        "BRAND_NAME": ["FRIGIDAIRE®"],
        "INVOICE_DESC": ["DISHWASHER LEG 5 SST 120V 15A 50-1/4IN"],
        "MOBILE_DESC": ["FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher With CleanBoost™, Leg Mounting, 5-Wash Cycle, Stainless Steel"],
        "SHORT_DESC": ["Professional Series Dishwasher, Leg Mounting, 5-Wash Cycle, Stainless Steel"],
        "ATTRIBUTE_LABEL 1": ["Series"],
        "ATTRIBUTE_VALUE 1": ["Professional Series"],
        "ATTRIBUTE_UOM 1": [""],
    }
    
    pred_data = {
        "PART_NUMBER": ["PDSH4816AF"],
        "Mfg_Part_Num": ["PDSH4816AF"],
        "MANUFACTURER_NAME": ["Rheem Manufacturing"],
        "BRAND_NAME": ["FRIGIDAIRE®"],
        "INVOICE_DESC": ["DISHWASHER LEG 5 SST 120V 15A 50-1/4IN"],
        "MOBILE_DESC": ["FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher With CleanBoost™, Leg Mounting, 5-Wash Cycle, Stainless Steel"],
        "SHORT_DESC": ["Professional Series Dishwasher, Leg Mounting, 5-Wash Cycle, Stainless Steel"],
        "ATTRIBUTE_LABEL 1": ["Series"],
        "ATTRIBUTE_VALUE 1": ["Professional Series"],
        "ATTRIBUTE_UOM 1": [""],
    }
    
    target_df = pd.DataFrame(target_data)
    pred_df = pd.DataFrame(pred_data)
    
    res = run_evaluation(pred_df, target_df)
    assert res["manufacturer_accuracy"] == 100.0
    assert res["brand_accuracy"] == 100.0
    assert res["overall_accuracy"] == 100.0
