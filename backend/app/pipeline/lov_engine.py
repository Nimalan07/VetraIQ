LOV_VOCABULARY = {
    "material": [
        "Silicon Carbide",
        "Cubitron II",
        "Aluminum Oxide",
        "Stainless Steel",
        "Brass",
        "Zirconia Alumina",
        "Bronze",
        "Carbon Steel",
    ],
    "compatible_parts": [
        "Belt Sanders",
        "Orbital Sanders",
        "Standard plumbing lines",
        "Sander",
        "Angle Grinders",
        "Belt Sander",
        "Orbital Sander",
    ],
    "mounting_type": [
        "Leg",
        "Built-in",
        "Wall-mount",
        "Threaded",
        "Flanged",
    ],
}

def resolve_lov_value(attribute_name: str, value: str) -> str:
    """
    Validate and snap extracted attributes to official List-of-Values (LOVs) when applicable.
    """
    if not value or str(value).lower() in ("not available", "none", "null"):
        return ""
        
    attr_key = str(attribute_name).lower().replace(" ", "_").strip()
    val_clean = str(value).strip()
    
    if attr_key in LOV_VOCABULARY:
        allowed = LOV_VOCABULARY[attr_key]
        for item in allowed:
            if item.lower() == val_clean.lower():
                return item
                
    return val_clean
